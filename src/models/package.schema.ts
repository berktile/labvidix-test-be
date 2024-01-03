import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document as MongooseDocument } from 'mongoose';
import { ProcessedData } from './processedData.schema';
import { User } from './user.schema';
import { RawDocument } from './rawDocument.schema';

@Schema({ timestamps: true })
export class Package extends MongooseDocument {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: String, required: true })
  packageName: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RawDocument' }],
  })
  rawDocuments: RawDocument[];
}

export const PackageSchema = SchemaFactory.createForClass(Package);
