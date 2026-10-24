import { HttpError } from '../lib/http-error.js';
import { Album } from '../models/album.js';
import { Artist } from '../models/artist.js';
import { Song } from '../models/song.js';

async function assertArtistExists(id) {
  if (id && !(await Artist.exists({ _id: id }))) {
    throw HttpError.badRequest('El artista indicado no existe');
  }
}

export async function getAlbum(req, res) {
  const album = await Album.findById(req.params.id).populate('artist');
  if (!album) throw HttpError.notFound('El álbum no existe');
  res.json({ album });
}

export async function getAlbums(req, res) {
  const { artistId } = req.params;
  const query = artistId ? Album.find({ artist: artistId }).sort('year') : Album.find().sort('title');
  const albums = await query.populate('artist');
  res.json({ albums });
}

export async function createAlbum(req, res) {
  await assertArtistExists(req.body.artist);
  const album = await Album.create(req.body);
  res.status(201).json({ album });
}

export async function updateAlbum(req, res) {
  await assertArtistExists(req.body.artist);
  const album = await Album.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!album) throw HttpError.notFound('El álbum no existe');
  res.json({ album });
}

export async function deleteAlbum(req, res) {
  const album = await Album.findByIdAndDelete(req.params.id);
  if (!album) throw HttpError.notFound('El álbum no existe');
  await Song.deleteMany({ album: album._id });
  res.json({ album });
}

export async function uploadImage(req, res) {
  const album = await Album.findByIdAndUpdate(
    req.params.id,
    { image: req.file.filename },
    { returnDocument: 'after' },
  );
  if (!album) throw HttpError.notFound('El álbum no existe');
  res.json({ album });
}
