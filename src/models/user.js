import { Schema, model } from 'mongoose';

export const ROLES = Object.freeze({ USER: 'ROLE_USER', ADMIN: 'ROLE_ADMIN' });

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    surname: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
    image: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  },
);

export const User = model('User', userSchema);
