// Debe importarse antes que cualquier módulo de `src/`: `config/env.js` valida process.env al cargarse.
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:27017/test';
process.env.JWT_SECRET = 'test-secret-de-al-menos-16-caracteres';
process.env.UPLOAD_DIR = mkdtempSync(path.join(tmpdir(), 'music-api-'));
