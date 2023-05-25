import { Module } from '@nestjs/common';
import { SignatureModule } from './signature/signature.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [SignatureModule, MongooseModule.forRoot('mongodb+srv://dbUser:%23Niks2023@cluster0.lsqkhwx.mongodb.net/pdflib')],
})
export class AppModule { }
