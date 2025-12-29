const Holidays = require('date-holidays')

function getHolidaysForYear(year) {
  const hd = new Holidays('ES', 'CT')
  return hd.getHolidays(year)
}

function isHoliday(date, holidays) {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0]
  return holidays.some(holiday => {
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
}

module.exports = {
  getHolidaysForYear,
  isHoliday
}

