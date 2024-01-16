import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import {
  PutObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { InjectModel } from '@nestjs/mongoose';
import { RawDocument } from '../models/rawDocument.schema';
import { User } from 'src/models/user.schema';
import { NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Package } from 'src/models/package.schema';
import { ProcessedData } from 'src/models/processedData.schema';
import { Readable } from 'stream';
import { PackageService } from 'src/package/package.service';

@Injectable()
export class UploadService {
  constructor(
    private readonly configService: ConfigService,
    private readonly packageService: PackageService,
    @InjectModel(RawDocument.name) private rawDocumentModel: Model<RawDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Package.name) private packageModel: Model<Package>,
    @InjectModel(ProcessedData.name)
    private processedDataModel: Model<ProcessedData>,
  ) {}
  private readonly bucketName = this.configService.get('AWS_BUCKET_NAME');
  private readonly region = this.configService.get('AWS_DEFAULT_REGION');
  private readonly accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
  private readonly secretAccessKey = this.configService.get(
    'AWS_SECRET_ACCESS_KEY',
  );
  private readonly extractionsBucketName = this.configService.get(
    'AWS_EXTRACTIONS_BUCKET_NAME',
  );

  private readonly s3Client = new S3Client({
    region: this.region,
    credentials: {
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
    },
  });

  async uploadFiles(
    files: Express.Multer.File[],
    userId: string,
  ): Promise<
    { response: PutObjectCommandOutput; location: string; package: any }[]
  > {
    const uploadedFiles = [];
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const packageName = `Package_${new Date().getTime()}`;
    const newPackage = await this.packageModel.create({
      user: user._id,
      packageName: packageName,
      creationDate: new Date(),
      rawDocuments: [],
      processedData: [],
    });

    user.packages.push(newPackage._id);
    await user.save();

    for (const file of files) {
      if (!file.buffer) {
        throw new BadRequestException('No file found');
      }

      const fileName = file.originalname;
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
      });

      const response = await this.s3Client.send(command);

      const rawDocument = await this.rawDocumentModel.create({
        user: user._id,
        fileType: fileName.split('.').pop() || '',
        fileName: fileName,
        uploadDate: new Date(),
        documentName: fileName,
        s3Key: fileName,
        documentUrl: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`,
        package: newPackage._id,
      });

      try {
        await this.saveProcessedData(rawDocument);
      } catch (error) {
        console.error('Error saving processed data:', error.message);
      }

      newPackage.rawDocuments.push(rawDocument._id);
      await newPackage.save();
      await user.save();

      uploadedFiles.push({
        fileName: fileName,
        response: {
          ...response,
          location: rawDocument.documentUrl,
        },
      });
    }

    const lastPackage = await this.packageService.getPackage(
      user._id,
      newPackage._id,
    );

    uploadedFiles.push({
      package: lastPackage,
    });

    return uploadedFiles;
  }

  private async saveProcessedData(rawDocument: RawDocument): Promise<void> {
    try {
      const jsonContent = await this.waitForS3Processing(rawDocument.s3Key);

      const processedData = new this.processedDataModel({
        user: rawDocument.user,
        extractedData: jsonContent,
        document: rawDocument,
        status: 'completed',
        processedDate: new Date(),
        documentUrl: rawDocument.documentUrl,
        documentName: rawDocument.documentName,
        s3Key: rawDocument.s3Key,
        fileType: rawDocument.fileType,
      });

      await processedData.save();

      rawDocument.processedDocument = processedData._id;
      await rawDocument.save();
    } catch (error) {
      console.error('S3 processing error:', error.message);
      throw new Error(error.message);
    }
  }

  private async waitForS3Processing(s3Key: string): Promise<any> {
    const replaceWithJson = s3Key.replace(/\.[^/.]+$/, '.json');
    const getObjectCommand = new GetObjectCommand({
      Bucket: this.extractionsBucketName,
      Key: `output/${replaceWithJson}`,
    });

    let retryCount = 0;
    const maxRetries = 15;
    const retryInterval = 1000;

    while (retryCount < maxRetries) {
      try {
        const response = await this.s3Client.send(getObjectCommand);
        const body = await this.streamToBuffer(response.Body as Readable);
        return JSON.parse(body.toString('utf-8'));
      } catch (error) {
        if (error.name === 'NoSuchKey') {
          retryCount++;
          await new Promise((resolve) => setTimeout(resolve, retryInterval));
        } else {
          throw new Error(error.message);
        }
      }
    }
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
