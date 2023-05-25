import mongoose from "mongoose";
import { Schema, Document } from 'mongoose';

export interface Pdf extends Document {
    filename: string;
    filePath: string;
}

export const PdfSchema: Schema<Pdf> = new Schema<Pdf>({
    filename: { type: String, required: true },
    filePath: { type: String, required: true },
});

export const Pdf = mongoose.model<Pdf>('Pdf', PdfSchema);
