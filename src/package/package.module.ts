import { Module } from '@nestjs/common';
import { PackageController } from './package.controller';
import { PackageService } from './package.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Package, PackageSchema } from '../models/package.schema';
import {
  ProcessedData,
  ProcessedDataSchema,
} from 'src/models/processedData.schema';
import { RawDocument, RawDocumentSchema } from 'src/models/rawDocument.schema';
import { User, UserSchema } from 'src/models/user.schema';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Package.name, schema: PackageSchema },
      { name: ProcessedData.name, schema: ProcessedDataSchema },
      { name: RawDocument.name, schema: RawDocumentSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [PackageController],
  providers: [PackageService, JwtService],
})
export class PackageModule {}
