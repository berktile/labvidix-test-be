import {
  Controller,
  Post,
  UseInterceptors,
  ParseFilePipe,
  ParseFilePipeBuilder,
  MaxFileSizeValidator,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { MultipleFileUploadDto } from './dto/MultipleFileUpload.dto';
import { TotalFileSizeGuard } from './guards/TotalFileSizeGuard';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { FileNameFilter } from './filters/FilenameFilter';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly fileNameFilter: FileNameFilter,
  ) {}

  @Post('/file')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: MultipleFileUploadDto })
  async uploadFile(
    @Request() req,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpeg|png|jpg|pdf)$/,
        })
        .addMaxSizeValidator({
          maxSize: 10000000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Express.Multer.File[],
  ) {
    const filteredFiles = files.map((file) => {
      file.originalname = this.fileNameFilter.filterFileName(file.originalname);
      return file;
    });

    const result = await this.uploadService.uploadFiles(
      filteredFiles,
      req.user.id,
    );
    return result;
  }
}
