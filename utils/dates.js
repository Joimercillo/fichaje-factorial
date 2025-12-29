function getWorkingDays(startDate, endDate, holidays) {
  const workingDays = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const current = new Date(start)
  
  while (current <= end) {
    const dayOfWeek = current.getDay()
    const dateStr = formatDateForFactorial(current)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isHolidayDate = holidays.some(holiday => {
      let holidayDate
      if (holiday.date instanceof Date) {
        holidayDate = holiday.date.toISOString().split('T')[0]
      } else if (typeof holiday.date === 'string') {
        holidayDate = new Date(holiday.date).toISOString().split('T')[0]
      } else {
        return false
      }
      return holidayDate === dateStr
    })
    
    if (!isWeekend && !isHolidayDate) {
      workingDays.push(dateStr)
    }
    
    current.setDate(current.getDate() + 1)
  }
  
  return workingDays
}

function formatDateForFactorial(date) {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateTimeForFactorial(date, time) {
  const dateStr = formatDateForFactorial(date)
  const timezoneOffset = getTimezoneOffset()
  return `${dateStr}T${time}:00${timezoneOffset}`
}

function getTimezoneOffset() {
  const now = new Date()
  const offset = -now.getTimezoneOffset()
  const hours = Math.floor(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60
  const sign = offset >= 0 ? '+' : '-'
  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

module.exports = {
  getWorkingDays,
  formatDateForFactorial,
  formatDateTimeForFactorial
}

