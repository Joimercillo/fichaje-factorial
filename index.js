require('dotenv').config()
const { getFichajeConfig } = require('./config/prompt')
const { getHolidaysForYear } = require('./utils/holidays')
const { getWorkingDays, formatDateForFactorial, formatDateTimeForFactorial } = require('./utils/dates')
const { createAttendanceShift } = require('./services/factorial')

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getStartAndEndDates(periodo, fechaFin) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let startDate = today
  let endDate
  
  if (periodo === 'month') {
    // Mes completo: desde el día 1 del mes actual hasta el último día del mes
    const year = today.getFullYear()
    const month = today.getMonth()
    startDate = new Date(year, month, 1)
    endDate = new Date(year, month + 1, 0) // Último día del mes
    endDate.setHours(23, 59, 59, 999)
  } else {
    // Rango: desde hoy hasta la fecha especificada
    if (!fechaFin) {
      throw new Error('Fecha de finalización no proporcionada')
    }
    endDate = new Date(fechaFin)
    if (isNaN(endDate.getTime())) {
      throw new Error(`Fecha inválida: ${fechaFin}`)
    }
    endDate.setHours(23, 59, 59, 999)
  }
  
  return {
    startDate: formatDateForFactorial(startDate),
    endDate: formatDateForFactorial(endDate)
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando aplicación de fichaje automático para Factorial\n')
    
    // Validar variables de entorno
    if (!process.env.FACTORIAL_COOKIE || !process.env.FACTORIAL_EMPLOYEE_ID) {
      console.error('❌ Error: Faltan variables de entorno necesarias.')
      console.error('Por favor, crea un archivo .env con las siguientes variables:')
      console.error('- FACTORIAL_COOKIE')
      console.error('- FACTORIAL_EMPLOYEE_ID')
      console.error('\nPuedes usar .env.example como plantilla.')
      process.exit(1)
    }
    
    // Obtener configuración del usuario
    const config = await getFichajeConfig()
    
    if (!config.confirmar) {
      console.log('❌ Operación cancelada por el usuario.')
      process.exit(0)
    }
    
    // Calcular fechas
    const { startDate, endDate } = getStartAndEndDates(config.periodo, config.fechaFin)
    console.log(`\n📅 Período: ${startDate} hasta ${endDate}`)
    
    // Obtener festivos
    const currentYear = new Date().getFullYear()
    const holidays = getHolidaysForYear(currentYear)
    console.log(`📆 Festivos encontrados: ${holidays.length}`)
    
    // Generar días laborables
    const workingDays = getWorkingDays(startDate, endDate, holidays)
    console.log(`💼 Días laborables a fichar: ${workingDays.length}\n`)
    
    if (workingDays.length === 0) {
      console.log('⚠️  No hay días laborables en el período seleccionado.')
      process.exit(0)
    }
    
    // Configuración de Factorial
    const factorialConfig = {
      cookie: process.env.FACTORIAL_COOKIE,
      employeeId: process.env.FACTORIAL_EMPLOYEE_ID,
      breakConfigId: process.env.FACTORIAL_BREAK_CONFIG_ID,
      locationType: process.env.FACTORIAL_LOCATION_TYPE || 'work_from_home'
    }
    
    // Estadísticas
    let exitosos = 0
    let errores = 0
    const erroresDetalle = []
    
    // Fichar cada día
    for (let i = 0; i < workingDays.length; i++) {
      const date = workingDays[i]
      console.log(`\n📝 Fichando día ${i + 1}/${workingDays.length}: ${date}`)
      
      try {
        // Fichaje mañana
        const clockInManana = formatDateTimeForFactorial(date, config.horaInicioManana)
        const clockOutManana = formatDateTimeForFactorial(date, config.horaFinManana)
        
        console.log(`  🌅 Mañana: ${config.horaInicioManana} - ${config.horaFinManana}`)
        await createAttendanceShift(date, clockInManana, clockOutManana, true, factorialConfig)
        exitosos++
        await delay(500)
        
        // Fichaje comida
        const clockInComida = formatDateTimeForFactorial(date, config.horaFinManana)
        const clockOutComida = formatDateTimeForFactorial(date, config.horaInicioTarde)
        
        console.log(`  🍽️  Comida: ${config.horaFinManana} - ${config.horaInicioTarde}`)
        await createAttendanceShift(date, clockInComida, clockOutComida, false, factorialConfig)
        exitosos++
        await delay(500)
        
        // Fichaje tarde
        const clockInTarde = formatDateTimeForFactorial(date, config.horaInicioTarde)
        const clockOutTarde = formatDateTimeForFactorial(date, config.horaFinTarde)
        
        console.log(`  🌆 Tarde: ${config.horaInicioTarde} - ${config.horaFinTarde}`)
        await createAttendanceShift(date, clockInTarde, clockOutTarde, true, factorialConfig)
        exitosos++
        await delay(500)
        
        console.log(`  ✅ Día ${date} fichado correctamente`)
      } catch (error) {
        errores++
        erroresDetalle.push({ date, error: error.message })
        console.error(`  ❌ Error al fichar ${date}: ${error.message}`)
      }
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(50))
    console.log('📊 RESUMEN')
    console.log('='.repeat(50))
    console.log(`✅ Fichajes exitosos: ${exitosos}`)
    console.log(`❌ Fichajes con error: ${errores}`)
    
    if (erroresDetalle.length > 0) {
      console.log('\n⚠️  Errores detallados:')
      erroresDetalle.forEach(({ date, error }) => {
        console.log(`  - ${date}: ${error}`)
      })
    }
    
    console.log('\n✨ Proceso completado')
  } catch (error) {
    console.error('\n❌ Error fatal:', error.message)
    process.exit(1)
  }
}

main()
