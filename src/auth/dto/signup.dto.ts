import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { RawDocument } from 'src/models/rawDocument.schema';

@ApiExtraModels(RawDocument)
export class SignUpDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly username?: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  readonly password: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsEmail(
    {},
    {
      message: 'Please provide a valid email address',
    },
  )
  readonly email: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsDate()
  readonly createdAt?: Date;

  @ApiProperty({
    type: Date,
    required: false,
  })
  @IsOptional()
  @IsDate()
  readonly updatedAt?: Date;
  @ApiProperty({
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isAdmin: boolean;

  @ApiProperty({
    type: 'array',
    required: false,
    items: {
      $ref: getSchemaPath(RawDocument),
      type: 'object',
    },
  })
  @IsOptional()
  readonly documents: RawDocument[];
}
