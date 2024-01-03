import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document as MongooseDocument } from 'mongoose';
import { RawDocument } from './rawDocument.schema';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class ProcessedData extends MongooseDocument {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: Object, required: true })
  extractedData: object;

  @Prop({ type: String, ref: 'RawDocument' })
  document: RawDocument;

  @Prop({
    type: String,
    default: 'pending',
    enum: ['pending', 'completed', 'failed'],
    required: true,
  })
  status: string;

  @Prop({ type: Date, default: Date.now })
  processedDate: Date;

  @Prop({ type: String })
  documentUrl: string;

  @Prop({ type: String })
  documentName: string;

  @Prop({ type: String })
  s3Key: string;

  @Prop({ type: String, default: 'json' })
  fileType: string;
}

export const ProcessedDataSchema = SchemaFactory.createForClass(ProcessedData);
