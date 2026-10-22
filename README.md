# API REST · App Music

API para la aplicación de música [app-music-](https://github.com/david-matos-salvador/app-music-): usuarios, artistas, álbumes y canciones con subida de imágenes y audio.

**Stack:** Node.js 22+ · Express 5 · Mongoose 9 · JWT · Multer 2 · Zod 4 · Helmet · `node:test`

## Puesta en marcha

```bash
cp .env.example .env   # y rellena MONGODB_URI y JWT_SECRET
npm install
npm run dev            # recarga automática con node --watch
```

Para dar permisos de administrador a un usuario ya registrado:

```bash
npm run make-admin -- usuario@example.com
```

## Scripts

| Script               | Descripción                                            |
| -------------------- | ------------------------------------------------------ |
| `npm start`          | Arranca el servidor (producción)                       |
| `npm run dev`        | Arranca en modo desarrollo con recarga                 |
| `npm test`           | Tests (unitarios + integración con MongoDB en memoria) |
| `npm run lint`       | ESLint                                                 |
| `npm run format`     | Prettier                                               |
| `npm run make-admin` | Promueve un usuario a `ROLE_ADMIN`                     |

Los tests de integración usan `mongodb-memory-server`, que descarga un binario de MongoDB la primera vez. Si no hay acceso a internet puedes usar un `mongod` local con `MONGOMS_SYSTEM_BINARY=/ruta/a/mongod` u omitirlos con `SKIP_DB_TESTS=1`.

## Estructura

```
src/
  app.js              # Configuración de Express (helmet, cors, rutas, errores)
  server.js           # Conexión a MongoDB, arranque y apagado ordenado
  config/             # Variables de entorno validadas y conexión a BD
  controllers/        # Lógica de cada recurso (async/await)
  middlewares/        # Auth (JWT + roles), validación, subida de ficheros, errores
  models/             # Esquemas de Mongoose
  routes/             # Definición de rutas
  schemas.js          # Esquemas de validación (zod)
test/                 # Tests con node:test + supertest
```

## Endpoints

Todas las rutas cuelgan de `/api`. Las marcadas con 🔒 requieren `Authorization: Bearer <token>`; las marcadas con 👑 requieren además rol `ROLE_ADMIN`.

| Método | Ruta                        | Descripción                                                           |
| ------ | --------------------------- | --------------------------------------------------------------------- |
| POST   | `/register`                 | Registro                                                              |
| POST   | `/login`                    | Login → `{ user, token }`                                             |
| GET    | `/me` 🔒                    | Usuario autenticado                                                   |
| PUT    | `/update-user/:id` 🔒       | Actualiza nombre, apellidos y email propios                           |
| POST   | `/upload-image/:id` 🔒      | Sube avatar (campo `image`)                                           |
| GET    | `/get-image/:fileName`      | Sirve un avatar                                                       |
| GET    | `/artists/:page?` 🔒        | Artistas paginados → `{ artists, total, page, pageSize, totalPages }` |
| GET    | `/artist/:id` 🔒            | Detalle de artista                                                    |
| POST   | `/artist` 👑                | Crea artista                                                          |
| PUT    | `/artist/:id` 👑            | Actualiza artista                                                     |
| DELETE | `/artist/:id` 👑            | Borra artista, sus álbumes y canciones                                |
| POST   | `/upload-img-artist/:id` 👑 | Sube imagen (campo `image`)                                           |
| GET    | `/get-img-artist/:fileName` | Sirve imagen de artista                                               |
| GET    | `/albums/:artistId?` 🔒     | Álbumes (de un artista o todos)                                       |
| GET    | `/album/:id` 🔒             | Detalle de álbum                                                      |
| POST   | `/album` 👑                 | Crea álbum                                                            |
| PUT    | `/album/:id` 👑             | Actualiza álbum                                                       |
| DELETE | `/album/:id` 👑             | Borra álbum y sus canciones                                           |
| POST   | `/upload-img-album/:id` 👑  | Sube portada (campo `image`)                                          |
| GET    | `/get-img-album/:fileName`  | Sirve portada                                                         |
| GET    | `/songs/:albumId?` 🔒       | Canciones (de un álbum o todas)                                       |
| GET    | `/song/:id` 🔒              | Detalle de canción                                                    |
| POST   | `/song` 👑                  | Crea canción                                                          |
| PUT    | `/song/:id` 👑              | Actualiza canción                                                     |
| DELETE | `/song/:id` 👑              | Borra canción                                                         |
| POST   | `/upload_song/:id` 👑       | Sube audio (campo `file`: mp3, ogg, wav, m4a)                         |
| GET    | `/get_song/:fileName`       | Sirve audio                                                           |

Los errores siempre devuelven `{ "message": "..." }` con el código HTTP adecuado (400, 401, 403, 404, 409, 500).
