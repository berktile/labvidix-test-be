import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document as MongooseDocument } from 'mongoose';
import { ProcessedData } from './processedData.schema';
import { User } from './user.schema';
import { Package } from './package.schema';
@Schema({ timestamps: true })
export class RawDocument extends MongooseDocument {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: String })
  fileType: string;

  @Prop({ type: Date, default: Date.now })
  uploadDate: Date;

  @Prop({ type: String })
  documentName: string;

  @Prop({ type: String })
  s3Key: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProcessedData' })
  processedDocument: ProcessedData;

  @Prop({ type: String })
  documentUrl: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Package' })
  package: Package;
}

export const RawDocumentSchema = SchemaFactory.createForClass(RawDocument);
