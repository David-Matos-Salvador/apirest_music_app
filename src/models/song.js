import { Schema, model } from 'mongoose';

const songSchema = new Schema(
  {
    number: { type: Number, required: true, min: 1 },
    name: { type: String, required: true, trim: true },
    duration: { type: String, default: '', trim: true },
    file: { type: String, default: null },
    album: { type: Schema.Types.ObjectId, ref: 'Album', required: true, index: true },
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

export const Song = model('Song', songSchema);
