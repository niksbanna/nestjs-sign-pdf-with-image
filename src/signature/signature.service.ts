import { Injectable, UploadedFile } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import { existsSync, promises as fs } from 'fs';
import { join } from 'path';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pdf } from '../entity/pdf.entity';

const UPLOAD_PATH = './uploads/';
const SAMPLE_PDF_PATH = './sample.pdf';

@Injectable()
export class SignatureService {
  constructor(
    @InjectModel('Pdf') private readonly pdfModel: Model<Pdf>,
  ) { }


  async uploadSignature(@UploadedFile() file: Express.Multer.File) {
    const session = await this.pdfModel.db.startSession();
    session.startTransaction();
    console.log(file);
    const filePath = file.path;
    try {
      const pdfDoc = await PDFDocument.load(await fs.readFile(SAMPLE_PDF_PATH));

      const page = pdfDoc.getPages()[0];
      const { width, height } = page.getSize();
      const signatureImage = await pdfDoc.embedPng(await fs.readFile(filePath));
      const signatureImageDims = signatureImage.scale(0.2);

      page.drawImage(signatureImage, {
        x: width - signatureImageDims.width - 40,
        y: 100,
        width: signatureImageDims.width,
        height: signatureImageDims.height,
      });

      const updatedPdfBuffer = await pdfDoc.save();
      const updatedPdfPath = join(file.destination, `updated${file.filename}.pdf`);
      await fs.writeFile(updatedPdfPath, updatedPdfBuffer);

      const createdPdf = await this.pdfModel.create({
        filename: file.filename,
        filePath: updatedPdfPath,
      });

      await session.commitTransaction();
      session.endSession();

      return { message: 'Signature added successfully', pdfId: createdPdf._id };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    } finally {
      if (existsSync(filePath)) {
        await fs.unlink(filePath);
      }
    }
  }

  async downloadPdf(pdfId: string, res: Response) {
    const pdf = await this.pdfModel.findById(pdfId);
    if (!pdf) {
      throw new Error('PDF not found');
    }

    const file = pdf.filePath;
    res.download(file, pdf.filename, (err) => {
      if (err) {
        throw err;
      }
    });
  }

  async deletePdf(pdfId: string) {
    const pdf = await this.pdfModel.findByIdAndDelete(pdfId);
    if (!pdf) {
      throw new Error('PDF not found');
    }

    await fs.unlink(pdf.filePath);
    return { message: 'PDF file deleted successfully' };
  }
}
