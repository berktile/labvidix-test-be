import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';
import {
  ProcessedData,
  ProcessedDataSchema,
} from '../models/processedData.schema';
import { User, UserSchema } from '../models/user.schema';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProcessedData.name, schema: ProcessedDataSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ResultsController],
  providers: [ResultsService, JwtService],
})
export class ResultsModule {}
