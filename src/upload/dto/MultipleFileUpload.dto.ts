import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class FileItemDto {
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  @IsNotEmpty()
  file: any;
}

export class MultipleFileUploadDto {
  @ApiProperty({ type: [FileItemDto], required: true })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FileItemDto)
  files: FileItemDto[];
}
