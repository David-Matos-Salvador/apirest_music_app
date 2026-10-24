import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { env } from '../config/env.js';
import { HttpError } from '../lib/http-error.js';

const MB = 1024 * 1024;

export const UPLOAD_ROOT = path.resolve(env.UPLOAD_DIR);

const presets = {
  image: { extensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp'], maxSize: 5 * MB },
  audio: { extensions: ['.mp3', '.ogg', '.wav', '.m4a'], maxSize: 25 * MB },
};

export function uploadDirFor(folder) {
  return path.join(UPLOAD_ROOT, folder);
}

/**
 * Crea un middleware que acepta un único fichero en `field` y lo guarda en `upload/<folder>`
 * con un nombre aleatorio. El nombre final queda en `req.file.filename`.
 */
export function singleUpload({ folder, field, kind }) {
  const { extensions, maxSize } = presets[kind];
  const destination = uploadDirFor(folder);
  mkdirSync(destination, { recursive: true });

  const storage = multer.diskStorage({
    destination,
    filename: (_req, file, cb) => {
      cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
    },
  });

  const fileFilter = (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!extensions.includes(ext)) {
      return cb(HttpError.badRequest(`Extensión no válida. Permitidas: ${extensions.join(', ')}`));
    }
    cb(null, true);
  };

  const handler = multer({ storage, fileFilter, limits: { fileSize: maxSize } }).single(field);

  return (req, res, next) => {
    handler(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        const message =
          error.code === 'LIMIT_FILE_SIZE'
            ? `El fichero supera el tamaño máximo de ${maxSize / MB} MB`
            : error.message;
        return next(HttpError.badRequest(message));
      }
      if (error) return next(error);
      if (!req.file) return next(HttpError.badRequest(`No se ha enviado ningún fichero en "${field}"`));
      next();
    });
  };
}

/** Envía un fichero subido evitando path traversal (`../`). */
export function sendUploadedFile(folder) {
  return (req, res, next) => {
    const fileName = path.basename(req.params.fileName);
    res.sendFile(fileName, { root: uploadDirFor(folder) }, (error) => {
      if (error && !res.headersSent) next(HttpError.notFound('El fichero no existe'));
    });
  };
}
