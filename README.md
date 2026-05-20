# MedAssist — App Movil

App movil de MedAssist, un asistente medico personal con autenticacion segura, consultas medicas con IA, analisis de examenes de laboratorio y recordatorios de medicamentos.

## Stack

| Componente | Tecnologia |
|---|---|
| Framework | Expo SDK 55 |
| Lenguaje | TypeScript |
| Navegacion | Expo Router |
| Estado | Zustand |
| Estilos | StyleSheet nativo |
| HTTP | Axios + interceptores |
| Storage | expo-secure-store (nativo) / sessionStorage (web) |
| Notificaciones | expo-notifications |
| Imagenes | expo-image-picker + expo-image-manipulator |

## Requisitos

- Node.js 18+
- pnpm
- Expo CLI (`npx expo`)
- Android SDK (para development build)

## Instalacion

```bash
cd mobile

# Instalar dependencias
pnpm install

# Configurar URL de la API
cp .env.example .env
```

## Configuracion

Edita `.env` con la URL de tu backend:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.XXX:8000
```

Para dispositivo fisico, usa la IP de tu PC (no `localhost`):

```bash
# Obtener tu IP en Windows
ipconfig
# Busca "Adaptador de LAN inalambrica Wi-Fi" -> Direccion IPv4
```

Requisitos para conexion:
- PC y telefono en la **misma red WiFi**
- Backend corriendo con `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Firewall permitiendo puerto 8000

## Ejecucion

```bash
# Expo Go (desarrollo rapido)
pnpm start

# Development build (necesario para notificaciones)
pnpm run android
```

> **Nota:** `expo-notifications` no funciona en Expo Go desde SDK 53. Para probar notificaciones reales, necesitas un development build.

## Estructura

```
mobile/
├── src/
│   ├── app/
│   │   ├── _layout.tsx               # Root layout + canal notificaciones Android
│   │   ├── index.tsx                 # Entry point (redirect auth)
│   │   ├── (auth)/                   # Grupo de auth (sin tabs)
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx             # Pantalla de login
│   │   │   └── register.tsx          # Pantalla de registro
│   │   └── (tabs)/                   # Grupo de tabs (protegido)
│   │       ├── _layout.tsx           # Configuracion de tabs
│   │       ├── index.tsx             # Home screen + dashboard
│   │       ├── consultation.tsx      # Formulario de consulta medica
│   │       ├── result.tsx            # Resultado de consulta IA
│   │       ├── history.tsx           # Historial de consultas
│   │       ├── lab-exam.tsx          # Captura de examen (camara/galeria)
│   │       ├── lab-result.tsx        # Resultado de analisis de examen
│   │       └── alerts.tsx            # Alertas de medicamentos
│   ├── store/
│   │   ├── authStore.ts              # Zustand auth + refresh tokens
│   │   └── medicationStore.ts        # Zustand medicamentos + notificaciones
│   ├── services/
│   │   ├── api.ts                    # Axios client + interceptor 401 + labsApi
│   │   └── notificationService.ts    # Programar/cancelar notificaciones
│   ├── utils/
│   │   └── storage.ts                # Storage wrapper (web + native)
│   └── constants/
│       ├── config.ts                 # API URL por plataforma
│       └── theme.ts                  # Colores y estilos globales
├── .env.example                      # Template de variables de entorno
└── package.json
```

## Pantallas

### Autenticacion
- **Login:** Email + contrasena con refresh token
- **Registro:** Nombre + email + contrasena + confirmacion

### Tabs principales
- **Inicio:** Saludo personalizado, accesos rapidos a consulta y examenes, logout
- **Consulta:** Formulario con datos del paciente, signos vitales, sintomas
- **Resultado:** Analisis IA con nivel de atencion, recomendaciones y disclaimer permanente
- **Historial:** Lista de consultas anteriores con detalles
- **Lab Exam:** Captura de examen via camara o galeria (soporte web + nativo)
- **Lab Result:** Valores extraidos, flags fuera de rango, explicacion y disclaimer
- **Alertas:** Gestion de medicamentos con notificaciones programadas

## Autenticacion

### Flujo

1. **App inicia** → Verifica token guardado
2. **Si hay token valido** → Redirige a `(tabs)/`
3. **Si no hay token** → Redirige a `(auth)/login`
4. **Login exitoso** → Guarda access token + refresh token + usuario, redirige a `(tabs)/`
5. **Token expirado (401)** → Interceptor usa refresh token automaticamente
6. **Logout** → Limpia storage, redirige a login

### Validaciones

**Login:**
- Email con formato valido
- Contrasena requerida

**Registro:**
- Nombre: minimo 2 caracteres, sin HTML
- Email: formato valido, unico
- Contrasena: 8+ chars, mayuscula, minuscula, numero, caracter especial
- Confirmar contrasena: debe coincidir

### Seguridad

- **Tokens:** Almacenados en `expo-secure-store` (nativo) o `sessionStorage` (web)
- **Refresh tokens:** 7 dias de expiracion, rotacion automatica en 401
- **Expiracion:** Se verifica `exp` claim antes de restaurar sesion
- **401 handler:** Interceptor de Axios reintentara con refresh token antes de hacer logout
- **HTTPS:** Requerido en produccion

## Analisis de Examenes

### Flujo
1. Usuario selecciona camara o galeria
2. Imagen se comprime con `expo-image-manipulator` (omitido en web)
3. Se sube como `FormData` al endpoint `/api/v1/labs/analyze`
4. Gemini 2.0 Flash analiza la imagen y extrae valores
5. Resultado se muestra con valores fuera de rango marcados

### Soporte multiplataforma
- **Mobile:** `expo-image-picker` + compresion + `FormData` nativo
- **Web:** `expo-image-picker` + `fetch()` → `blob()` → `FormData` (sin compresion)

### Validaciones del backend
- Solo JPEG, PNG, WebP
- Validacion por magic bytes (no Content-Type del cliente)
- Tamano maximo: 10 MB
- Proteccion contra path traversal

## Alertas de Medicamentos

### Funcionalidad
- Agregar medicamentos con nombre, dosis y frecuencia
- Programar notificaciones locales recurrentes
- Activar/desactivar alertas individuales
- Persistencia local con SecureStore

### Frecuencias disponibles
- Cada 4, 6, 8, 12 o 24 horas

### Notas importantes
- Las notificaciones usan `TIME_INTERVAL` con `repeats: true` para compatibilidad cross-platform
- En Android se requiere un canal de notificaciones dedicado (`medication-alerts`)
- En Expo Go las notificaciones no funcionan (limitacion de SDK 53+)

## Endpoints del Backend

| Metodo | Path | Descripcion |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Registro |
| `POST` | `/api/v1/auth/login` | Login |
| `POST` | `/api/v1/auth/refresh` | Renovar token |
| `GET` | `/api/v1/auth/me` | Perfil |
| `POST` | `/api/v1/medical/consultation` | Consulta medica |
| `GET` | `/api/v1/medical/consultations` | Historial |
| `POST` | `/api/v1/labs/analyze` | Analizar examen |
| `GET` | `/api/v1/labs/history` | Historial de examenes |

## Disclaimer Medico

Todas las pantallas de resultado incluyen un disclaimer permanente:

> "Este analisis es solo orientativo y no reemplaza un diagnostico medico profesional. Ante cualquier duda o resultado fuera de rango, consulta con un profesional de salud."

## Troubleshooting

### "Host desconocido" al compilar Android
Problema de DNS/firewall. Verifica que puedes acceder a `https://dl.google.com`.

### `ninja: error: manifest 'build.ninja' still dirty`
Los paths de pnpm son demasiado largos para CMake en Windows. Solucion:
```bash
# Agregar a mobile/.npmrc
echo "node-linker=hoisted" > .npmrc
# Reinstalar y limpiar
rm -rf node_modules android/.cxx android/build android/app/build
pnpm install
pnpm run android
```

### Notificaciones no funcionan en Expo Go
Esperado desde SDK 53. Usa `npx expo run:android` para un development build.

### Error de conexion al backend
1. Verifica que `EXPO_PUBLIC_API_URL` en `.env` apunta a la IP correcta
2. Backend debe correr con `--host 0.0.0.0`
3. Firewall de Windows debe permitir puerto 8000

## Proximos pasos

- [ ] Notificaciones funcionando en development build
- [ ] Modo oscuro
- [ ] Iconos de tab bar
- [ ] Editar medicamentos existentes
- [ ] Sonido personalizado para alertas
- [ ] Soporte offline (queue de requests)
