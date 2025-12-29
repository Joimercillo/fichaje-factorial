const axios = require('axios')

const FACTORIAL_API_URL = 'https://api.factorialhr.com/graphql?CreateAttendanceShift'

const CREATE_ATTENDANCE_SHIFT_MUTATION = `mutation CreateAttendanceShift($clockIn: ISO8601DateTime, $clockOut: ISO8601DateTime, $date: ISO8601Date!, $employeeId: Int!, $fetchDependencies: Boolean!, $halfDay: String, $locationType: AttendanceShiftLocationTypeEnum, $observations: String, $referenceDate: ISO8601Date!, $source: AttendanceEnumsShiftSourceEnum, $timeSettingsBreakConfigurationId: Int, $workable: Boolean) {
  attendanceMutations {
    createAttendanceShift(
      clockIn: $clockIn
      clockOut: $clockOut
      date: $date
      employeeId: $employeeId
      halfDay: $halfDay
      locationType: $locationType
      observations: $observations
      referenceDate: $referenceDate
      source: $source
      timeSettingsBreakConfigurationId: $timeSettingsBreakConfigurationId
      workable: $workable
    ) {
      errors {
        ...ErrorDetails
        __typename
      }
      shift {
        employee {
          id
          attendanceBalancesConnection(endOn: $referenceDate, startOn: $referenceDate) @include(if: $fetchDependencies) {
            nodes {
              ...TimesheetBalance
              __typename
            }
            __typename
          }
          attendanceWorkedTimesConnection(endOn: $referenceDate, startOn: $referenceDate) @include(if: $fetchDependencies) {
            nodes {
              ...TimesheetWorkedTime
              __typename
            }
            __typename
          }
          __typename
        }
        ...TimesheetPageShift
        __typename
      }
      __typename
    }
    __typename
  }
}

fragment TimesheetBalancePoolBlock on AttendanceTimeBlock {
  _uniqueKey
  equivalentMinutesInCents
  minutes
  name
  rawMinutesInCents
  sourcePoolType
  timeSettingsCustomTimeRangeCategoryId
  __typename
}

fragment TimesheetWorkedTimeBlock on AttendanceWorkedTimeBlock {
  approved
  complementaryHour
  date
  extraHour
  minutes
  poolType
  timeRangeCategoryId
  timeRangeCategoryName
  timeSettingsBreakConfigurationId
  timeType
  workable
  __typename
}

fragment TimesheetTimeSettingsBreakConfiguration on TimeSettingsBreakConfiguration {
  id
  paid
  __typename
}

fragment TimesheetPageWorkplace on LocationsLocation {
  id
  name
  __typename
}

fragment ErrorDetails on MutationError {
  ... on SimpleError {
    message
    type
    __typename
  }
  ... on StructuredError {
    field
    messages
    __typename
  }
  __typename
}

fragment TimesheetBalance on AttendanceBalance {
  id
  accumulationEndOn
  accumulationStartOn
  balancePools {
    transfers {
      ...TimesheetBalancePoolBlock
      __typename
    }
    type
    usages {
      ...TimesheetBalancePoolBlock
      __typename
    }
    __typename
  }
  complementaryTimeMinutes
  dailyBalance
  dailyBalanceFromContract
  dailyBalanceFromPlanning
  date
  extraTimeCalculated
  extraTimeCalculationOn
  updatedAt
  __typename
}

fragment TimesheetWorkedTime on AttendanceWorkedTime {
  id
  approvedExtraTimeMinutes
  breaksMinutesRounded
  date
  dayType
  effectiveWorkedMinutes
  extraTimeMinutes
  minutes
  multipliedMinutes
  paidAbsencesMinutes
  paidBreaksMinutes
  pendingMinutes
  regularMinutes
  toleranceMinutesRounded
  trackedMinutes
  trackedMinutesDelta
  workedTimeBlocks {
    ...TimesheetWorkedTimeBlock
    __typename
  }
  __typename
}

fragment TimesheetPageShift on AttendanceShift {
  id
  automaticClockIn
  automaticClockOut
  clockIn
  clockInWithSeconds
  clockOut
  crossesMidnight
  date
  employeeId
  halfDay
  isOvernight
  locationType
  minutes
  observations
  periodId
  referenceDate
  showPlusOneDay
  timeSettingsBreakConfiguration {
    ...TimesheetTimeSettingsBreakConfiguration
    __typename
  }
  workable
  workplace {
    ...TimesheetPageWorkplace
    __typename
  }
  __typename
}`

async function createAttendanceShift(date, clockIn, clockOut, workable, config) {
  const { cookie, employeeId, breakConfigId, locationType } = config

  if (!cookie || !employeeId) {
    throw new Error('Faltan credenciales de Factorial. Verifica tu archivo .env')
  }

  const payload = {
    operationName: 'CreateAttendanceShift',
    variables: {
      date,
      employeeId: parseInt(employeeId),
      clockIn,
      clockOut,
      referenceDate: date,
      locationType: locationType || 'work_from_home',
      source: 'desktop',
      timeSettingsBreakConfigurationId: breakConfigId ? parseInt(breakConfigId) : null,
      workable,
      fetchDependencies: false
    },
    query: CREATE_ATTENDANCE_SHIFT_MUTATION
  }

  try {
    const response = await axios.post(FACTORIAL_API_URL, payload, {
      headers: {
        'accept': '*/*',
        'accept-language': 'es-ES,es;q=0.9',
        'content-type': 'application/json',
        'x-deployment-phase': 'default',
        'x-factorial-origin': 'web',
        'x-factorial-version': '652ca20dfd36e53e490b6a7732f6c089be51eb17',
        'cookie': cookie,
        'Referer': 'https://app.factorialhr.com/'
      }
    })

    if (response.data?.data?.attendanceMutations?.createAttendanceShift?.errors?.length > 0) {
      const errors = response.data.data.attendanceMutations.createAttendanceShift.errors
      throw new Error(`Error de Factorial: ${JSON.stringify(errors)}`)
    }

    return response.data
  } catch (error) {
    if (error.response) {
      const status = error.response.status
      const statusText = error.response.statusText
      
      if (status === 401) {
        throw new Error(`Error 401 Unauthorized: La cookie de sesión ha expirado o es inválida.\n` +
          `Por favor, obtén una nueva cookie desde las herramientas de desarrollador del navegador\n` +
          `cuando estés logueado en https://app.factorialhr.com y actualiza tu archivo .env`)
      }
      
      const errorData = error.response.data || {}
      throw new Error(`Error HTTP ${status} ${statusText}: ${JSON.stringify(errorData)}`)
    }
    throw error
  }
}

module.exports = {
  createAttendanceShift
}

