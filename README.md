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

## Requisitos

- Node.js 18+
- pnpm
- Expo CLI (`npx expo`)

## Instalacion

```bash
cd mobile

# Instalar dependencias
pnpm install
```

## Configuracion

La URL de la API se configura automaticamente segun la plataforma en `src/constants/config.ts`:

- **Android emulador:** `http://10.0.2.2:8000`
- **iOS simulator:** `http://localhost:8000`
- **Web:** `http://localhost:8000`

Para produccion, usa la variable de entorno `EXPO_PUBLIC_API_URL`:

```bash
EXPO_PUBLIC_API_URL=https://tu-api.com pnpm start
```

## Ejecucion

```bash
# Iniciar Expo
pnpm start

# Opciones:
# - a: Abrir en Android
# - i: Abrir en iOS
# - w: Abrir en navegador web
```

## Estructura

```
mobile/
├── src/
│   ├── app/
│   │   ├── _layout.tsx           # Root layout con Stack
│   │   ├── index.tsx             # Entry point (redirect auth)
│   │   ├── (auth)/               # Grupo de auth (sin tabs)
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx         # Pantalla de login
│   │   │   └── register.tsx      # Pantalla de registro
│   │   └── (tabs)/               # Grupo de tabs (protegido)
│   │       ├── _layout.tsx
│   │       └── index.tsx         # Home screen
│   ├── store/
│   │   └── authStore.ts          # Zustand auth state
│   ├── services/
│   │   └── api.ts                # Axios client + interceptors
│   ├── utils/
│   │   └── storage.ts            # Storage wrapper (web + native)
│   └── constants/
│       └── config.ts             # API URL por plataforma
└── package.json
```

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

## Endpoints del Backend

| Metodo | Path | Descripcion |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Registro |
| `POST` | `/api/v1/auth/login` | Login |
| `GET` | `/api/v1/auth/me` | Perfil |

## Proximos pasos

- [ ] Pantalla de consulta medica con IA
- [ ] Pantalla de recordatorios de medicamentos
- [ ] Pantalla de historial de consultas
- [ ] Notificaciones push para recordatorios
- [ ] Modo oscuro
- [ ] Iconos de tab bar
