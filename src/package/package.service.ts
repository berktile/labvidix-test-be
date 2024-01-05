import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Package } from 'src/models/package.schema';
import { ProcessedData } from 'src/models/processedData.schema';
import { RawDocument } from 'src/models/rawDocument.schema';
import { User } from 'src/models/user.schema';
import { ConfigService } from '@nestjs/config';
import { timestamp } from 'rxjs';

@Injectable()
export class PackageService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(RawDocument.name) private rawDocumentModel: Model<RawDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Package.name) private packageModel: Model<Package>,
    @InjectModel(ProcessedData.name)
    private processedDataModel: Model<ProcessedData>,
  ) {}

  async getUserPackagesAndResults(userId: string): Promise<any> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const packageIds = user.packages.map((packageItem) => packageItem._id);

      const results = await this.packageModel
        .aggregate([
          { $match: { _id: { $in: packageIds } } },
          {
            $lookup: {
              from: 'rawdocuments',
              localField: '_id',
              foreignField: 'package',
              as: 'rawDocuments',
            },
          },
          {
            $unwind: '$rawDocuments',
          },
          {
            $lookup: {
              from: 'processeddatas',
              localField: 'rawDocuments.processedDocument',
              foreignField: '_id',
              as: 'extractedFile',
            },
          },
          {
            $unwind: {
              path: '$extractedFile',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              createdAt: {
                $dateToString: {
                  format: '%d/%m/%Y %H:%M',
                  date: '$createdAt',
                  timezone: 'Europe/London',
                },
              },
            },
          },
          {
            $group: {
              _id: '$_id',
              packageName: { $first: '$packageName' },
              createdAt: { $first: '$createdAt' },
              rawDocuments: { $push: '$rawDocuments' },
              extractedFile: { $first: '$extractedFile' },
            },
          },
          {
            $project: {
              _id: 1,
              packageName: 1,
              createdAt: 1,
              rawDocuments: {
                $map: {
                  input: '$rawDocuments',
                  as: 'rawDoc',
                  in: {
                    _id: '$$rawDoc._id',
                    documentName: '$$rawDoc.documentName',
                    documentUrl: '$$rawDoc.documentUrl',
                    uploadDate: '$$rawDoc.uploadDate',
                    extractedFile: {
                      _id: '$extractedFile._id',
                      extractedData: '$extractedFile.extractedData',
                      extractionDate: '$extractedFile.processedDate',
                      status: '$extractedFile.status',
                    },
                  },
                },
              },
            },
          },
        ])
        .exec();

      if (!results || results.length === 0) {
        throw new NotFoundException('Packages not found');
      }

      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async editPackageName(
    userId: string,
    packageId: string,
    packageName: string,
  ): Promise<{
    message: string;
  }> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const packageItem = await this.packageModel.findById(packageId);
      if (!packageItem) {
        throw new NotFoundException('Package not found');
      }

      packageItem.packageName = packageName;
      await packageItem.save();

      return {
        message: 'Package name updated successfully',
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getPackage(userId: string, packageId: string): Promise<any> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const packageItem = await this.packageModel.findById(packageId);
      if (!packageItem) {
        throw new NotFoundException('Package not found');
      }

      const results = await this.packageModel
        .aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(packageId) } },
          {
            $lookup: {
              from: 'rawdocuments',
              localField: '_id',
              foreignField: 'package',
              as: 'rawDocuments',
            },
          },
          {
            $unwind: '$rawDocuments',
          },
          {
            $lookup: {
              from: 'processeddatas',
              localField: 'rawDocuments.processedDocument',
              foreignField: '_id',
              as: 'extractedFile',
            },
          },
          {
            $unwind: {
              path: '$extractedFile',
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $group: {
              _id: '$_id',
              createdAt: { $first: '$createdAt' },
              packageName: { $first: '$packageName' },
              rawDocuments: { $push: '$rawDocuments' },
              extractedFiles: { $push: '$extractedFile' },
            },
          },
          {
            $project: {
              _id: 1,
              packageName: 1,
              createdAt: 1,

              rawDocument: {
                $map: {
                  input: '$rawDocuments',
                  as: 'rawDoc',
                  in: {
                    _id: '$$rawDoc._id',
                    documentName: '$$rawDoc.documentName',
                    documentUrl: '$$rawDoc.documentUrl',
                    uploadDate: '$$rawDoc.uploadDate',
                    extractedFile: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$extractedFiles',
                            cond: {
                              $eq: ['$$this._id', '$$rawDoc.processedDocument'],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                },
              },
            },
          },
        ])
        .exec();

      if (!results || results.length === 0) {
        throw new NotFoundException('Packages not found');
      }

      return results[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
