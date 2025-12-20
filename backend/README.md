# CodeKeep Backend API

Backend API para la aplicación CodeKeep construido con NestJS, TypeORM y PostgreSQL.

## 🚀 Características

- ✅ Autenticación JWT completa (registro, login, perfil)
- ✅ Gestión de usuarios con configuraciones personalizadas
- ✅ CRUD completo de snippets de código
- ✅ Sistema de favoritos y bookmarks
- ✅ Filtrado por lenguaje, tags y búsqueda
- ✅ Relaciones many-to-many con TypeORM
- ✅ Validación de datos con class-validator
- ✅ CORS habilitado para integración con frontend

## 📋 Requisitos Previos

- Node.js >= 18.x
- **MySQL >= 8.x**
- npm o yarn

## ⚙️ Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de base de datos:
```env
PORT=3001
NODE_ENV=development

DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=<YOUR_DB_PASSWORD>
DB_DATABASE=codekeep

JWT_SECRET=<YOUR_JWT_SECRET_HERE>
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

3. **Crear base de datos MySQL:**
```sql
CREATE DATABASE codekeep;
```

## 🏃 Ejecutar la Aplicación

### Modo desarrollo
```bash
npm run start:dev
```

### Modo producción
```bash
npm run build
npm run start:prod
```

La API estará corriendo en: `http://localhost:3001/api`

## 📚 Endpoints Disponibles

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Registrar nuevo usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |
| GET | `/auth/profile` | Obtener perfil | Sí |

### Usuarios (`/api/users`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/users/profile` | Obtener perfil completo | Sí |
| PATCH | `/users/profile` | Actualizar perfil y settings | Sí |
| GET | `/users/stats` | Obtener estadísticas | Sí |

### Snippets (`/api/snippets`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/snippets` | Listar todos los snippets | Sí |
| GET | `/snippets/:id` | Obtener snippet por ID | Sí |
| POST | `/snippets` | Crear nuevo snippet | Sí |
| PATCH | `/snippets/:id` | Actualizar snippet | Sí |
| DELETE | `/snippets/:id` | Eliminar snippet | Sí |
| GET | `/snippets/tags` | Obtener todos los tags | Sí |

**Query params para filtrado:**
- `language`: Filtrar por lenguaje (ej: `javascript`, `python`)
- `search`: Buscar en título y código
- `tags`: Filtrar por tags (separados por coma)

### Favoritos (`/api/favorites`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/favorites` | Listar favoritos | Sí |
| POST | `/favorites/:snippetId` | Agregar a favoritos | Sí |
| DELETE | `/favorites/:snippetId` | Quitar de favoritos | Sí |

### Bookmarks (`/api/bookmarks`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/bookmarks` | Listar bookmarks | Sí |
| POST | `/bookmarks/:snippetId` | Agregar bookmark | Sí |
| DELETE | `/bookmarks/:snippetId` | Quitar bookmark | Sí |

## 🔐 Autenticación

Todos los endpoints protegidos requieren un token JWT en el header:

```
Authorization: Bearer <tu_token_jwt>
```

## 📦 Ejemplos de Uso

### Registro
```bash
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

### Login
```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123"
}
```

### Crear Snippet
```bash
POST http://localhost:3001/api/snippets
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "React Hook useState",
  "code": "const [count, setCount] = useState(0);",
  "language": "javascript",
  "tags": ["react", "hooks"]
}
```

### Filtrar Snippets
```bash
GET http://localhost:3001/api/snippets?language=javascript&search=react&tags=hooks
Authorization: Bearer <token>
```

## 🗄️ Estructura de Base de Datos

### Tabla `users`
- `id` (UUID, PK)
- `name`, `email`, `password`
- `avatar`, `theme`, `notifications`, etc.
- Relaciones: `snippets[]`, `favorites[]`, `bookmarks[]`

### Tabla `snippets`
- `id` (UUID, PK)
- `title`, `code`, `language`, `tags[]`
- `userId` (FK → users)
- Timestamps: `createdAt`, `updatedAt`

### Tablas de Relaciones
- `user_favorites` (User ↔ Snippet many-to-many)
- `user_bookmarks` (User ↔ Snippet many-to-many)

## 🛠️ Tecnologías Utilizadas

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para TypeScript
- **PostgreSQL** - Base de datos relacional
- **Passport & JWT** - Autenticación
- **bcrypt** - Hash de contraseñas
- **class-validator** - Validación de DTOs

## 📝 Notas de Desarrollo

- La sincronización automática de TypeORM está habilitada en desarrollo (`synchronize: true`)
- En producción, usa migraciones de TypeORM para cambios en el esquema
- Los passwords se hashean con bcrypt (10 rounds)
- Los tokens JWT expiran en 7 días por defecto

## 🔄 Próximos Pasos

1. Integrar el frontend React con estos endpoints
2. Implementar refresh tokens
3. Agregar paginación a snippets
4. Implementar compartir snippets entre usuarios
5. Agregar tests unitarios y e2e

## 📄 Licencia

MIT
