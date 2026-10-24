import { HttpError } from '../lib/http-error.js';
import { Album } from '../models/album.js';
import { Artist } from '../models/artist.js';
import { Song } from '../models/song.js';

const PAGE_SIZE = 8;

async function findArtistOr404(id) {
  const artist = await Artist.findById(id);
  if (!artist) throw HttpError.notFound('El artista no existe');
  return artist;
}

export async function getArtist(req, res) {
  res.json({ artist: await findArtistOr404(req.params.id) });
}

export async function getArtists(req, res) {
  const page = Math.max(Number.parseInt(req.params.page ?? '1', 10) || 1, 1);

  const [artists, total] = await Promise.all([
    Artist.find()
      .sort('name')
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE),
    Artist.countDocuments(),
  ]);

  res.json({
    artists,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1),
  });
}

export async function createArtist(req, res) {
  const artist = await Artist.create(req.body);
  res.status(201).json({ artist });
}

export async function updateArtist(req, res) {
  const artist = await Artist.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!artist) throw HttpError.notFound('El artista no existe');
  res.json({ artist });
}

export async function deleteArtist(req, res) {
  const artist = await Artist.findByIdAndDelete(req.params.id);
  if (!artist) throw HttpError.notFound('El artista no existe');

  // Borrado en cascada: álbumes del artista y canciones de esos álbumes.
  const albumIds = await Album.find({ artist: artist._id }).distinct('_id');
  await Song.deleteMany({ album: { $in: albumIds } });
  await Album.deleteMany({ _id: { $in: albumIds } });

  res.json({ artist });
}

export async function uploadImage(req, res) {
  const artist = await Artist.findByIdAndUpdate(
    req.params.id,
    { image: req.file.filename },
    { returnDocument: 'after' },
  );
  if (!artist) throw HttpError.notFound('El artista no existe');
  res.json({ artist });
}
