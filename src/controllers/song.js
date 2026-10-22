import { HttpError } from '../lib/http-error.js';
import { Album } from '../models/album.js';
import { Song } from '../models/song.js';

const populateAlbumAndArtist = { path: 'album', populate: { path: 'artist' } };

async function assertAlbumExists(id) {
  if (id && !(await Album.exists({ _id: id }))) {
    throw HttpError.badRequest('El álbum indicado no existe');
  }
}

export async function getSong(req, res) {
  const song = await Song.findById(req.params.id).populate(populateAlbumAndArtist);
  if (!song) throw HttpError.notFound('La canción no existe');
  res.json({ song });
}

export async function getSongs(req, res) {
  const { albumId } = req.params;
  const songs = await Song.find(albumId ? { album: albumId } : {})
    .sort('number')
    .populate(populateAlbumAndArtist);
  res.json({ songs });
}

export async function createSong(req, res) {
  await assertAlbumExists(req.body.album);
  const song = await Song.create(req.body);
  res.status(201).json({ song });
}

export async function updateSong(req, res) {
  await assertAlbumExists(req.body.album);
  const song = await Song.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!song) throw HttpError.notFound('La canción no existe');
  res.json({ song });
}

export async function deleteSong(req, res) {
  const song = await Song.findByIdAndDelete(req.params.id);
  if (!song) throw HttpError.notFound('La canción no existe');
  res.json({ song });
}

export async function uploadAudio(req, res) {
  const song = await Song.findByIdAndUpdate(
    req.params.id,
    { file: req.file.filename },
    { returnDocument: 'after' },
  );
  if (!song) throw HttpError.notFound('La canción no existe');
  res.json({ song });
}
