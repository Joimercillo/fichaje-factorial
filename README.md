# Fichaje Factorial

Aplicación CLI para automatizar el registro de fichajes en Factorial, con soporte para festivos de Sabadell (Cataluña) y horario configurable.

## Características

- ✅ Fichaje automático para períodos completos (mes completo o rango de fechas)
- ✅ Detección automática de días festivos de Sabadell (Cataluña)
- ✅ Exclusión automática de fines de semana y festivos
- ✅ Horario configurable (por defecto: 9-14h y 15-18h)
- ✅ Tres fichajes por día: mañana, comida y tarde
- ✅ Interfaz interactiva con prompts

## Requisitos Previos

- Node.js v20 o superior
- npm o yarn
- Cuenta activa en Factorial
- Acceso a las herramientas de desarrollador del navegador

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/Joimercillo/fichaje-factorial.git
cd fichaje-factorial
```

2. Instala las dependencias:
```bash
npm install
```

## Configuración

### 1. Crear archivo `.env`

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
FACTORIAL_COOKIE=tu_cookie_completa_aqui
FACTORIAL_EMPLOYEE_ID=tu_employee_id
FACTORIAL_BREAK_CONFIG_ID=tu_break_config_id
FACTORIAL_LOCATION_TYPE=work_from_home
```

### 2. Obtener las credenciales de Factorial

#### Obtener la Cookie de Sesión

1. Abre tu navegador y ve a [https://app.factorialhr.com](https://app.factorialhr.com)
2. Inicia sesión en tu cuenta
3. Abre las herramientas de desarrollador:
   - **Chrome/Edge**: `F12` o `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
   - **Firefox**: `F12` o `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
   - **Safari**: `Cmd+Option+I` (Mac, primero activa el menú de desarrollador en Preferencias)
4. Ve a la pestaña **Network** (Red)
5. Realiza cualquier acción en Factorial (por ejemplo, ver tu fichaje del día)
6. Busca una petición a `api.factorialhr.com` en la lista
7. Haz clic en la petición y ve a la sección **Headers** → **Request Headers**
8. Busca el header `cookie` y copia **todo su valor completo**
9. Pega el valor completo en `FACTORIAL_COOKIE` en tu archivo `.env`

**Ejemplo de cookie completa:**
```
_factorial_id=eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0...; AMP_MKTG_0ab91ba82c=JTdCJTIycmVmZXJyZXIlMjIlM0ElMjJodHRwcz...; _factorial_session_v2=19bf161bd1a839039104d38f3639b3a9; _factorial_data=%7B%22company_id%22%3A338389...; AMP_0ab91ba82c=JTdCJTIyb3B0T3V0JTIyJTNBZmFsc2UlMkMlMjJkZXZpY2VJZCUyMiUzQSUyMmQyNGM5YTc3...
```

⚠️ **Importante**: La cookie debe incluir **todas** las cookies separadas por punto y coma (`;`), no solo una.

#### Obtener el Employee ID

1. En las herramientas de desarrollador, ve a la pestaña **Network** (Red)
2. Realiza una acción que haga una petición a la API (por ejemplo, ver tu fichaje)
3. Busca una petición a `api.factorialhr.com/graphql`
4. Haz clic en la petición y ve a la pestaña **Payload** o **Request**
5. Busca el campo `employeeId` en el JSON
6. Copia el valor numérico y pégalo en `FACTORIAL_EMPLOYEE_ID` en tu archivo `.env`

**Ejemplo:**
```env
FACTORIAL_EMPLOYEE_ID=3138131
```

#### Obtener el Break Config ID (Opcional)

1. Sigue los mismos pasos que para obtener el Employee ID
2. Busca el campo `timeSettingsBreakConfigurationId` en el payload
3. Copia el valor numérico y pégalo en `FACTORIAL_BREAK_CONFIG_ID` en tu archivo `.env`

**Ejemplo:**
```env
FACTORIAL_BREAK_CONFIG_ID=23667
```

#### Configurar el Tipo de Ubicación

El valor por defecto es `work_from_home`. Puedes cambiarlo a:
- `work_from_home` - Teletrabajo
- `office` - Oficina
- Otros valores según tu configuración en Factorial

**Ejemplo:**
```env
FACTORIAL_LOCATION_TYPE=work_from_home
```

### 3. Ejemplo de archivo `.env` completo

```env
FACTORIAL_COOKIE=_factorial_id=eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJjZWxsIjoiYXdzLXByb2QtZXVjZW50cmFsMS1nbG9iMDEifQ.; AMP_MKTG_0ab91ba82c=JTdCJTIycmVmZXJyZXIlMjIlM0ElMjJodHRwcyUzQSUyRiUyRmFwaS5mYWN0b3JpYWxoci5jb20lMkYlMjIlMkMlMjJyZWZlcnJpbmdfZG9tYWluJTIyJTNBJTIyYXBpLmZhY3RvcmlhbGhyLmNvbSUyMiU3RA==; _factorial_session_v2=19bf161bd1a839039104d38f3639b3a9; _factorial_data=%7B%22company_id%22%3A338389%2C%22user_id%22%3A3179002%2C%22access_id%22%3A3265674%2C%22session_id%22%3A%22bcb2e256-43b6-459d-84e8-550578d90f6e%22%2C%22locale%22%3A%22es-es%22%2C%22is_factorial%22%3Afalse%7D; AMP_0ab91ba82c=JTdCJTIyb3B0T3V0JTIyJTNBZmFsc2UlMkMlMjJkZXZpY2VJZCUyMiUzQSUyMmQyNGM5YTc3LTJjN2QtNGNhYi1hNGZiLTdhMzU1MzJiM2NhYiUyMiUyQyUyMmxhc3RFdmVudFRpbWUlMjIlM0ExNzY3MDA2OTQ5OTU2JTJDJTIyc2Vzc2lvbklkJTIyJTNBMTc2NzAwNjMzMDk3OSUyQyUyMnVzZXJJZCUyMiUzQSUyMjMyNjU2NzQlMjIlN0Q=
FACTORIAL_EMPLOYEE_ID=3138131
FACTORIAL_BREAK_CONFIG_ID=23667
FACTORIAL_LOCATION_TYPE=work_from_home
```

## Uso

### Ejecutar la aplicación

```bash
npm start
```

### Modo desarrollo (con auto-reload)

```bash
npm run dev
```

### Flujo de la aplicación

1. La aplicación te preguntará qué período quieres fichar:
   - **Mes completo**: Fichará desde el día 1 hasta el último día del mes actual
   - **Rango personalizado**: Fichará desde hoy hasta una fecha específica (formato: YYYY-MM-DD)

2. Configurar el horario (valores por defecto):
   - **Hora inicio mañana**: 09:00
   - **Hora fin mañana**: 14:00
   - **Hora inicio tarde**: 15:00
   - **Hora fin tarde**: 18:00

3. Confirmar antes de ejecutar

4. La aplicación:
   - Obtendrá los festivos de Sabadell (Cataluña) para el año actual
   - Generará la lista de días laborables (excluyendo fines de semana y festivos)
   - Creará 3 fichajes por cada día laborable:
     - **Mañana**: Entrada y salida (workable: true)
     - **Comida**: Entrada y salida (workable: false)
     - **Tarde**: Entrada y salida (workable: true)

5. Mostrará un resumen final con estadísticas

## Estructura del Proyecto

```
fichaje-factorial/
├── config/
│   └── prompt.js          # Configuración de prompts interactivos
├── services/
│   └── factorial.js       # Servicio para comunicarse con la API de Factorial
├── utils/
│   ├── dates.js           # Utilidades para manejo de fechas
│   └── holidays.js        # Utilidades para festivos
├── .env                   # Variables de entorno (no incluido en git)
├── .gitignore            # Archivos ignorados por git
├── index.js              # Punto de entrada de la aplicación
├── package.json          # Dependencias y scripts
└── README.md             # Este archivo
```

## Solución de Problemas

### Error 401 Unauthorized

Si recibes un error 401, significa que tu cookie de sesión ha expirado. Debes:
1. Obtener una nueva cookie siguiendo los pasos de la sección "Obtener la Cookie de Sesión"
2. Actualizar el valor de `FACTORIAL_COOKIE` en tu archivo `.env`

### Las opciones no se muestran en los prompts

Si las opciones de la lista no se muestran, asegúrate de estar usando Node.js v20 o superior y que todas las dependencias estén instaladas correctamente.

### Error al obtener festivos

La aplicación está configurada para obtener festivos de Cataluña (ES-CT). Si necesitas cambiar la región, modifica el archivo `utils/holidays.js`.

## Notas Importantes

- ⚠️ La cookie de sesión expira periódicamente. Deberás actualizarla cuando recibas errores 401
- ⚠️ La aplicación respeta los días festivos de Sabadell (Cataluña). Si necesitas otra región, modifica `utils/holidays.js`
- ⚠️ Los fichajes se crean con un delay de 500ms entre peticiones para evitar rate limiting
- ⚠️ Asegúrate de que el archivo `.env` esté en el directorio raíz del proyecto y no se suba a git

## Licencia

ISC

## Autor

Desarrollado para automatizar el proceso de fichaje en Factorial.

