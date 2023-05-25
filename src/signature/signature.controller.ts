import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { SignatureService } from './signature.service';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('signature')
export class SignatureController {
  constructor(private readonly signatureService: SignatureService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      },
    }),
    limits: { fileSize: 50000 }
  }))
  async uploadSignature(@UploadedFile() file: Express.Multer.File) {
    return this.signatureService.uploadSignature(file);
  }

  @Get('download/:pdfId')
  async downloadPdf(@Param('pdfId') pdfId: string, @Res() res: Response) {
    return this.signatureService.downloadPdf(pdfId, res);
  }

  @Delete('delete/:pdfId')
  async deletePdf(@Param('pdfId') pdfId: string) {
    return this.signatureService.deletePdf(pdfId);
  }
}
