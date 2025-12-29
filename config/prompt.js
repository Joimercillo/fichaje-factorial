const inquirer = require('inquirer')

async function getFichajeConfig() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'periodo',
      message: '¿Qué período quieres fichar?',
      choices: [
        'Mes completo (día 1 al último día del mes actual)',
        'Rango personalizado (desde hoy hasta fecha específica)'
      ],
      filter: (input) => {
        if (input.includes('Mes completo')) return 'month'
        if (input.includes('Rango personalizado')) return 'range'
        return input
      }
    },
    {
      type: 'input',
      name: 'fechaFin',
      message: 'Introduce la fecha de finalización (formato: YYYY-MM-DD, ejemplo: 2024-12-31):',
      when: (answers) => answers.periodo === 'range',
      validate: (input) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(input)) {
          return 'Formato incorrecto. Usa YYYY-MM-DD (ejemplo: 2024-12-31)'
        }
        const date = new Date(input)
        if (isNaN(date.getTime())) {
          return 'Fecha inválida. Usa el formato YYYY-MM-DD (ejemplo: 2024-12-31)'
        }
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (date < today) {
          return 'La fecha no puede ser anterior a hoy'
        }
        return true
      }
    },
    {
      type: 'input',
      name: 'horaInicioManana',
      message: 'Hora de inicio de la mañana (formato: HH:mm, ejemplo: 09:00):',
      default: '09:00',
      validate: (input) => {
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
        return timeRegex.test(input) || 'Formato incorrecto. Usa HH:mm (ejemplo: 09:00)'
      }
    },
    {
      type: 'input',
      name: 'horaFinManana',
      message: 'Hora de finalización de la mañana (formato: HH:mm, ejemplo: 14:00):',
      default: '14:00',
      validate: (input) => {
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
        return timeRegex.test(input) || 'Formato incorrecto. Usa HH:mm (ejemplo: 14:00)'
      }
    },
    {
      type: 'input',
      name: 'horaInicioTarde',
      message: 'Hora de inicio de la tarde (formato: HH:mm, ejemplo: 15:00):',
      default: '15:00',
      validate: (input) => {
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
        return timeRegex.test(input) || 'Formato incorrecto. Usa HH:mm (ejemplo: 15:00)'
      }
    },
    {
      type: 'input',
      name: 'horaFinTarde',
      message: 'Hora de finalización de la tarde (formato: HH:mm, ejemplo: 18:00):',
      default: '18:00',
      validate: (input) => {
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
        return timeRegex.test(input) || 'Formato incorrecto. Usa HH:mm (ejemplo: 18:00)'
      }
    },
    {
      type: 'confirm',
      name: 'confirmar',
      message: '¿Confirmas que quieres proceder con el fichaje?',
      default: false
    }
  ])

  return answers
}

module.exports = {
  getFichajeConfig
}

