# MedAssist — App Movil

App movil de MedAssist, un asistente medico personal con autenticacion segura, consultas medicas con IA y recordatorios de medicamentos.

## Stack

| Componente | Tecnologia |
|---|---|
| Framework | Expo SDK 55 |
| Lenguaje | TypeScript |
| Navegacion | Expo Router |
| Estado | Zustand |
| Estilos | StyleSheet nativo |
| HTTP | Axios |
| Storage | expo-secure-store |
| Notificaciones | expo-notifications |

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
```

## Configuracion

La URL de la API se configura en `src/constants/config.ts`:

```typescript
const LOCAL_IP = "192.168.0.XXX";  // IP de tu PC en la red WiFi
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
│   │       ├── index.tsx             # Home screen
│   │       ├── consultation.tsx      # Formulario de consulta medica
│   │       ├── result.tsx            # Resultado de consulta IA
│   │       ├── history.tsx           # Historial de consultas
│   │       └── alerts.tsx            # Alertas de medicamentos
│   ├── store/
│   │   ├── authStore.ts              # Zustand auth state
│   │   └── medicationStore.ts        # Zustand medicamentos + notificaciones
│   ├── services/
│   │   ├── api.ts                    # Axios client + interceptors
│   │   └── notificationService.ts    # Programar/cancelar notificaciones
│   ├── utils/
│   │   └── storage.ts                # Storage wrapper (web + native)
│   └── constants/
│       ├── config.ts                 # API URL por plataforma
│       └── theme.ts                  # Colores y estilos globales
└── package.json
```

## Pantallas

### Autenticacion
- **Login:** Email + contrasena
- **Registro:** Nombre + email + contrasena + confirmacion

### Tabs principales
- **Inicio:** Saludo personalizado, accesos rapidos, logout
- **Consulta:** Formulario con datos del paciente, signos vitales, sintomas
- **Historial:** Lista de consultas anteriores con detalles
- **Alertas:** Gestion de medicamentos con notificaciones programadas

## Autenticacion

### Flujo

1. **App inicia** → Verifica token guardado
2. **Si hay token valido** → Redirige a `(tabs)/`
3. **Si no hay token** → Redirige a `(auth)/login`
4. **Login exitoso** → Guarda token + usuario, redirige a `(tabs)/`
5. **Logout** → Limpia storage, redirige a login

### Validaciones

**Login:**
- Email con formato valido
- Contrasena requerida

**Registro:**
- Nombre: minimo 2 caracteres
- Email: formato valido, unico
- Contrasena: 8+ chars, mayuscula, minuscula, numero
- Confirmar contrasena: debe coincidir

### Seguridad

- **Tokens:** Almacenados en `expo-secure-store` (nativo) o `localStorage` (web)
- **Expiracion:** Se verifica `exp` claim antes de restaurar sesion
- **401 handler:** Interceptor de Axios limpia token automaticamente
- **HTTPS:** Requerido en produccion

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
| `GET` | `/api/v1/auth/me` | Perfil |
| `POST` | `/api/v1/medical/consultation` | Consulta medica |
| `GET` | `/api/v1/medical/consultations` | Historial |

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

## Proximos pasos

- [ ] Notificaciones funcionando en development build
- [ ] Modo oscuro
- [ ] Iconos de tab bar
- [ ] Editar medicamentos existentes
- [ ] Sonido personalizado para alertas
