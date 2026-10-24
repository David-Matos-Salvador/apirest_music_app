import bcrypt from 'bcrypt';
import { HttpError } from '../lib/http-error.js';
import { signToken } from '../lib/jwt.js';
import { User } from '../models/user.js';

const SALT_ROUNDS = 10;

export async function register(req, res) {
  const { name, surname, email, password } = req.body;

  if (await User.exists({ email })) {
    throw HttpError.conflict('Ya existe un usuario con ese email');
  }

  const user = await User.create({
    name,
    surname,
    email,
    password: await bcrypt.hash(password, SALT_ROUNDS),
  });

  res.status(201).json({ user });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  // Mismo mensaje para email y contraseña: no revelamos qué cuentas existen.
  const valid = user && (await bcrypt.compare(password, user.password));
  if (!valid) {
    throw HttpError.unauthorized('Email o contraseña incorrectos');
  }

  res.json({ user, token: signToken(user) });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw HttpError.notFound('El usuario no existe');
  res.json({ user });
}

function assertSelf(req) {
  if (req.params.id !== req.user.id) {
    throw HttpError.forbidden('No tienes permiso para actualizar este usuario');
  }
}

export async function updateUser(req, res) {
  assertSelf(req);

  if (req.body.email && (await User.exists({ email: req.body.email, _id: { $ne: req.params.id } }))) {
    throw HttpError.conflict('Ya existe un usuario con ese email');
  }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!user) throw HttpError.notFound('El usuario no existe');

  res.json({ user });
}

export async function uploadImage(req, res) {
  assertSelf(req);

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { image: req.file.filename },
    { returnDocument: 'after' },
  );
  if (!user) throw HttpError.notFound('El usuario no existe');

  res.json({ image: user.image, user });
}
