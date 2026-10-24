# apirest_music_app — reglas para agentes (Claude, Kimi, Kilo, otros)

API REST de App Music: usuarios, artistas, álbumes y canciones con subida de archivos.
Stack: Node.js 22 · Express 5 · Mongoose 9 · JWT · Multer · Zod · `node:test` + supertest.
El frontend que la consume es el repo [`app-music-`](https://github.com/David-Matos-Salvador/app-music-).

- **Antes de dar algo por terminado:** `npm run lint`, `npm run format:check` y `npm test`.
- **Publicar:** un push a `master` despliega solo en Coolify (producción en
  `https://api-app-music.davidmatos.lat`). Cambios grandes, por PR.
- **Datos:** MongoDB y Redis vienen de la infraestructura compartida del servidor. Los archivos
  subidos viven en el volumen `/app/upload`: no cambiar `UPLOAD_DIR` sin migrar los archivos.
- **Secretos:** solo en `.env` (local) y en las variables de Coolify (producción). Nunca en el
  código ni en el repo, que es **público**. Las variables se documentan en `.env.example`.
- **Tareas:** se registran en el repo privado `infra` (Issues), que también tiene el mapa de todos
  los proyectos (`PROJECTS.md`).
- Comentarios y documentación en español; nombres de código en inglés.
