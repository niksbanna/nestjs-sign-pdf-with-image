import { Module } from "@nestjs/common";
import { SignatureController } from "./signature.controller";
import { SignatureService } from "./signature.service";
import { MongooseModule } from "@nestjs/mongoose";
import { PdfSchema } from "src/entity/pdf.entity";

@Module({
    imports: [MongooseModule.forFeature([{ name: "Pdf", schema: PdfSchema }])],
    controllers: [SignatureController],
    providers: [SignatureService]
})
export class SignatureModule { }