import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import { Package } from 'src/models/package.schema';
import { ProcessedData } from 'src/models/processedData.schema';
import { RawDocument } from 'src/models/rawDocument.schema';
import { User } from 'src/models/user.schema';

@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(ProcessedData.name)
    private processedDataModel: Model<ProcessedData>,
  ) {}

  async updateResults(
    processedDataId: string,
    updatedExtractedData: any[],
    userId: string,
  ) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const processedData = await this.processedDataModel.findOne({
        _id: processedDataId,
        user: userId,
      });

      if (!processedData) {
        throw new NotFoundException('Processed data not found');
      }

      processedData.extractedData = updatedExtractedData;
      await processedData.save();

      return {
        message: 'Processed data updated successfully',
        updatedExtractedData: processedData.extractedData,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updateRating(processedDataId: string, rating: number, userId: string) {
    try {
      console.log(rating + 'rating');
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updatedData = await this.processedDataModel.updateOne(
        { _id: processedDataId, user: userId },
        { $set: { rating: rating } },
      );

      if (!updatedData) {
        throw new NotFoundException('Processed data not found');
      }

      return {
        message: 'Processed data updated successfully',
        updatedData: updatedData,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
