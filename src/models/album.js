import { Schema, model } from 'mongoose';

const albumSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    year: { type: Number, required: true },
    image: { type: String, default: null },
    artist: { type: Schema.Types.ObjectId, ref: 'Artist', required: true, index: true },
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

export const Album = model('Album', albumSchema);
