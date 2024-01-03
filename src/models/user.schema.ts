import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document as MongooseDocument } from 'mongoose';
import { RawDocument } from './rawDocument.schema';
import { ProcessedData } from './processedData.schema';
import { Package } from './package.schema';

@Schema({ timestamps: true })
export class User extends MongooseDocument {
  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true, min: 6 })
  password: string;

  @Prop({ type: String })
  refreshToken: string;

  @Prop({ type: Boolean, default: false })
  isAdmin: boolean;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }],
  })
  packages: Package[];
}

export const UserSchema = SchemaFactory.createForClass(User);
