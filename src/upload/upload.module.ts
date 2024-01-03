import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RawDocument, RawDocumentSchema } from 'src/models/rawDocument.schema';
import { User, UserSchema } from 'src/models/user.schema';
import { AuthModule } from 'src/auth/auth.module';
import { Package, PackageSchema } from 'src/models/package.schema';
import {
  ProcessedData,
  ProcessedDataSchema,
} from 'src/models/processedData.schema';
import { FileNameFilter } from './filters/FilenameFilter';
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('UPLOAD_RATE_TTL'),
          limit: config.get('UPLOAD_RATE_LIMIT'),
        },
      ],
    }),
    MongooseModule.forFeature([
      { name: RawDocument.name, schema: RawDocumentSchema },
      { name: User.name, schema: UserSchema },
      { name: Package.name, schema: PackageSchema },
      { name: ProcessedData.name, schema: ProcessedDataSchema },
    ]),
    AuthModule,
  ],
  controllers: [UploadController],
  providers: [
    UploadService,
    FileNameFilter,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class UploadModule {}
