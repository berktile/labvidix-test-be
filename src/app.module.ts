import { Module } from '@nestjs/common';
import { UploadModule } from './upload/upload.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { AuthModule } from './auth/auth.module';
import { PackageService } from './package/package.service';
import { PackageController } from './package/package.controller';
import { PackageModule } from './package/package.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validate,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    UploadModule,
    AuthModule,
    PackageModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
