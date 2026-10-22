import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import * as albums from '../controllers/album.js';
import * as artists from '../controllers/artist.js';
import * as songs from '../controllers/song.js';
import * as users from '../controllers/user.js';
import { requireAdmin, requireAuth } from '../middlewares/auth.js';
import { sendUploadedFile, singleUpload } from '../middlewares/upload.js';
import { validateBody, validateObjectId } from '../middlewares/validate.js';
import {
  albumSchema,
  artistSchema,
  loginSchema,
  partial,
  registerSchema,
  songSchema,
  updateUserSchema,
} from '../schemas.js';

// Las rutas mantienen los paths de la v1 para no romper clientes existentes.
export function createApiRouter({ authRateLimit = true } = {}) {
  const router = Router();
  const id = validateObjectId('id');
  const admin = [requireAuth, requireAdmin];

  const authLimiter = authRateLimit
    ? rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false })
    : (_req, _res, next) => next();

  // Usuarios
  router.post('/register', authLimiter, validateBody(registerSchema), users.register);
  router.post('/login', authLimiter, validateBody(loginSchema), users.login);
  router.get('/me', requireAuth, users.me);
  router.put('/update-user/:id', requireAuth, id, validateBody(updateUserSchema), users.updateUser);
  router.post(
    '/upload-image/:id',
    requireAuth,
    id,
    singleUpload({ folder: 'users', field: 'image', kind: 'image' }),
    users.uploadImage,
  );
  router.get('/get-image/:fileName', sendUploadedFile('users'));

  // Artistas
  router.get('/artists{/:page}', requireAuth, artists.getArtists);
  router.get('/artist/:id', requireAuth, id, artists.getArtist);
  router.post('/artist', admin, validateBody(artistSchema), artists.createArtist);
  router.put('/artist/:id', admin, id, validateBody(partial(artistSchema)), artists.updateArtist);
  router.delete('/artist/:id', admin, id, artists.deleteArtist);
  router.post(
    '/upload-img-artist/:id',
    admin,
    id,
    singleUpload({ folder: 'artist', field: 'image', kind: 'image' }),
    artists.uploadImage,
  );
  router.get('/get-img-artist/:fileName', sendUploadedFile('artist'));

  // Álbumes
  router.get('/albums{/:artistId}', requireAuth, validateObjectId('artistId'), albums.getAlbums);
  router.get('/album/:id', requireAuth, id, albums.getAlbum);
  router.post('/album', admin, validateBody(albumSchema), albums.createAlbum);
  router.put('/album/:id', admin, id, validateBody(partial(albumSchema)), albums.updateAlbum);
  router.delete('/album/:id', admin, id, albums.deleteAlbum);
  router.post(
    '/upload-img-album/:id',
    admin,
    id,
    singleUpload({ folder: 'album', field: 'image', kind: 'image' }),
    albums.uploadImage,
  );
  router.get('/get-img-album/:fileName', sendUploadedFile('album'));

  // Canciones
  router.get('/songs{/:albumId}', requireAuth, validateObjectId('albumId'), songs.getSongs);
  router.get('/song/:id', requireAuth, id, songs.getSong);
  router.post('/song', admin, validateBody(songSchema), songs.createSong);
  router.put('/song/:id', admin, id, validateBody(partial(songSchema)), songs.updateSong);
  router.delete('/song/:id', admin, id, songs.deleteSong);
  router.post(
    '/upload_song/:id',
    admin,
    id,
    singleUpload({ folder: 'song', field: 'file', kind: 'audio' }),
    songs.uploadAudio,
  );
  router.get('/get_song/:fileName', sendUploadedFile('song'));

  return router;
}
