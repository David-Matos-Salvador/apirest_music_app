import './setup-env.js';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Types } from 'mongoose';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { signToken } from '../src/lib/jwt.js';

// Tests que no necesitan base de datos: middlewares, validación y enrutado.
const app = createApp();

const tokenFor = (role) =>
  signToken({
    _id: new Types.ObjectId(),
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
    role,
    image: null,
  });

describe('app', () => {
  it('GET /health responde ok', async () => {
    const res = await request(app).get('/health').expect(200);
    assert.deepEqual(res.body, { status: 'ok' });
  });

  it('devuelve 404 en JSON para rutas desconocidas', async () => {
    const res = await request(app).get('/api/no-existe').expect(404);
    assert.match(res.body.message, /Ruta no encontrada/);
  });

  it('rechaza JSON mal formado con 400', async () => {
    await request(app)
      .post('/api/login')
      .set('Content-Type', 'application/json')
      .send('{"email":')
      .expect(400);
  });
});

describe('autenticación', () => {
  it('exige cabecera Authorization', async () => {
    await request(app).get('/api/artists').expect(401);
  });

  it('rechaza tokens inválidos', async () => {
    const res = await request(app).get('/api/artists').set('Authorization', 'Bearer basura').expect(401);
    assert.equal(res.body.message, 'Token no válido');
  });

  it('impide a un usuario normal crear artistas', async () => {
    await request(app)
      .post('/api/artist')
      .set('Authorization', `Bearer ${tokenFor('ROLE_USER')}`)
      .send({ name: 'Queen' })
      .expect(403);
  });

  it('impide actualizar a otro usuario', async () => {
    await request(app)
      .put(`/api/update-user/${new Types.ObjectId()}`)
      .set('Authorization', tokenFor('ROLE_USER'))
      .send({ name: 'Otro' })
      .expect(403);
  });
});

describe('validación', () => {
  it('valida el registro', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ name: 'Ada', surname: 'L', email: 'no-es-email', password: '123' })
      .expect(400);
    assert.match(res.body.message, /email/);
    assert.match(res.body.message, /password/);
  });

  it('rechaza identificadores no válidos', async () => {
    await request(app)
      .get('/api/artist/123')
      .set('Authorization', `Bearer ${tokenFor('ROLE_ADMIN')}`)
      .expect(400);
  });

  it('valida los datos del álbum', async () => {
    const res = await request(app)
      .post('/api/album')
      .set('Authorization', `Bearer ${tokenFor('ROLE_ADMIN')}`)
      .send({ title: '', year: 'abc', artist: 'x' })
      .expect(400);
    assert.match(res.body.message, /title/);
  });
});

describe('ficheros', () => {
  it('no permite path traversal al servir ficheros', async () => {
    await request(app).get('/api/get-image/..%2F..%2Fpackage.json').expect(404);
  });
});
