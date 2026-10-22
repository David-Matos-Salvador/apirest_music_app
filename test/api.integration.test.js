import './setup-env.js';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { Album } from '../src/models/album.js';
import { Song } from '../src/models/song.js';
import { User } from '../src/models/user.js';

// Levanta un MongoDB en memoria. Se puede omitir con SKIP_DB_TESTS=1
// (p. ej. en entornos sin acceso a fastdl.mongodb.org).
const skip = process.env.SKIP_DB_TESTS === '1';

describe('API con base de datos', { skip }, () => {
  let mongo;
  const app = createApp();
  const api = request(app);
  let admin;
  let user;

  async function registerAndLogin(data) {
    await api.post('/api/register').send(data).expect(201);
    const res = await api.post('/api/login').send({ email: data.email, password: data.password }).expect(200);
    return { token: `Bearer ${res.body.token}`, user: res.body.user };
  }

  before(async () => {
    mongo = await MongoMemoryServer.create();
    await connectDatabase(mongo.getUri());

    user = await registerAndLogin({
      name: 'Ana',
      surname: 'García',
      email: 'ana@example.com',
      password: 'secreto1',
    });
    await registerAndLogin({
      name: 'Root',
      surname: 'Admin',
      email: 'admin@example.com',
      password: 'secreto1',
    });
    await User.updateOne({ email: 'admin@example.com' }, { role: 'ROLE_ADMIN' });
    const res = await api.post('/api/login').send({ email: 'admin@example.com', password: 'secreto1' });
    admin = { token: `Bearer ${res.body.token}`, user: res.body.user };
  });

  after(async () => {
    await disconnectDatabase();
    await mongo?.stop();
  });

  describe('usuarios', () => {
    it('no expone la contraseña y normaliza el email', async () => {
      const res = await api
        .post('/api/register')
        .send({ name: 'Luis', surname: 'Pérez', email: '  LUIS@Example.com ', password: 'secreto1' })
        .expect(201);
      assert.equal(res.body.user.email, 'luis@example.com');
      assert.equal(res.body.user.password, undefined);
      assert.equal(res.body.user.role, 'ROLE_USER');
    });

    it('rechaza emails duplicados', async () => {
      await api
        .post('/api/register')
        .send({ name: 'Ana', surname: 'Bis', email: 'ana@example.com', password: 'secreto1' })
        .expect(409);
    });

    it('no distingue entre email inexistente y contraseña incorrecta', async () => {
      const a = await api.post('/api/login').send({ email: 'ana@example.com', password: 'mal' }).expect(401);
      const b = await api
        .post('/api/login')
        .send({ email: 'nadie@example.com', password: 'mal' })
        .expect(401);
      assert.equal(a.body.message, b.body.message);
    });

    it('GET /me devuelve el usuario autenticado', async () => {
      const res = await api.get('/api/me').set('Authorization', user.token).expect(200);
      assert.equal(res.body.user.email, 'ana@example.com');
    });

    it('permite actualizar el perfil pero ignora el rol', async () => {
      const res = await api
        .put(`/api/update-user/${user.user._id}`)
        .set('Authorization', user.token)
        .send({ name: 'Ana María', role: 'ROLE_ADMIN' })
        .expect(200);
      assert.equal(res.body.user.name, 'Ana María');
      assert.equal(res.body.user.role, 'ROLE_USER');
    });

    it('sube la imagen de perfil y la sirve', async () => {
      const res = await api
        .post(`/api/upload-image/${user.user._id}`)
        .set('Authorization', user.token)
        .attach('image', Buffer.from('fake-png'), 'avatar.png')
        .expect(200);
      assert.match(res.body.image, /\.png$/);
      await api.get(`/api/get-image/${res.body.image}`).expect(200);
    });

    it('rechaza extensiones no permitidas', async () => {
      await api
        .post(`/api/upload-image/${user.user._id}`)
        .set('Authorization', user.token)
        .attach('image', Buffer.from('x'), 'script.exe')
        .expect(400);
    });
  });

  describe('catálogo', () => {
    let artistId;
    let albumId;

    it('crea artista, álbum y canciones', async () => {
      const artist = await api
        .post('/api/artist')
        .set('Authorization', admin.token)
        .send({ name: 'Queen', description: 'Banda británica' })
        .expect(201);
      artistId = artist.body.artist._id;

      const album = await api
        .post('/api/album')
        .set('Authorization', admin.token)
        .send({ title: 'A Night at the Opera', year: 1975, artist: artistId })
        .expect(201);
      albumId = album.body.album._id;

      for (const [number, name] of [
        [10, 'Bohemian Rhapsody'],
        [2, 'Lazing on a Sunday Afternoon'],
      ]) {
        await api
          .post('/api/song')
          .set('Authorization', admin.token)
          .send({ number, name, duration: '5:55', album: albumId })
          .expect(201);
      }
    });

    it('lista canciones ordenadas numéricamente y con álbum y artista', async () => {
      const res = await api.get(`/api/songs/${albumId}`).set('Authorization', user.token).expect(200);
      assert.deepEqual(
        res.body.songs.map((s) => s.number),
        [2, 10],
      );
      assert.equal(res.body.songs[0].album.artist.name, 'Queen');
    });

    it('pagina artistas', async () => {
      const res = await api.get('/api/artists/1').set('Authorization', user.token).expect(200);
      assert.equal(res.body.total, 1);
      assert.equal(res.body.page, 1);
      assert.equal(res.body.artists[0].name, 'Queen');
    });

    it('actualiza parcialmente un álbum', async () => {
      const res = await api
        .put(`/api/album/${albumId}`)
        .set('Authorization', admin.token)
        .send({ year: 1976 })
        .expect(200);
      assert.equal(res.body.album.year, 1976);
      assert.equal(res.body.album.title, 'A Night at the Opera');
    });

    it('rechaza álbumes de artistas inexistentes', async () => {
      await api
        .post('/api/album')
        .set('Authorization', admin.token)
        .send({ title: 'X', year: 2000, artist: '0123456789abcdef01234567' })
        .expect(400);
    });

    it('borra en cascada álbumes y canciones del artista', async () => {
      await api.delete(`/api/artist/${artistId}`).set('Authorization', admin.token).expect(200);
      assert.equal(await Album.countDocuments({ artist: artistId }), 0);
      assert.equal(await Song.countDocuments({ album: albumId }), 0);
      await api.get(`/api/artist/${artistId}`).set('Authorization', user.token).expect(404);
    });
  });
});
