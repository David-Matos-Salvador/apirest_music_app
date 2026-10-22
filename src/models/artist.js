import { Schema, model } from 'mongoose';

const artistSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    image: { type: String, default: null },
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

export const Artist = model('Artist', artistSchema);
