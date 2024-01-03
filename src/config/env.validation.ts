import { IsNotEmpty, IsNumber, validateSync, IsString } from 'class-validator';
import { plainToInstance } from 'class-transformer';

class EnvironmentVariables {
  @IsNotEmpty()
  @IsNumber()
  PORT: number;

  @IsNotEmpty()
  @IsString()
  MONGODB_URI: string;

  @IsNotEmpty()
  @IsString()
  AWS_ACCESS_KEY_ID: string;

  @IsNotEmpty()
  @IsString()
  AWS_SECRET_ACCESS_KEY: string;

  @IsNotEmpty()
  @IsString()
  AWS_DEFAULT_REGION: string;

  @IsNotEmpty()
  @IsString()
  AWS_BUCKET_NAME: string;

  @IsNotEmpty()
  @IsNumber()
  MAX_FILE_SIZE: number;

  @IsNotEmpty()
  @IsString()
  JWT_SECRET_KEY: string;

  @IsNotEmpty()
  @IsString()
  JWT_EXPIRES_IN: string;

  @IsNotEmpty()
  @IsNumber()
  UPLOAD_RATE_LIMIT: number;

  @IsNotEmpty()
  @IsNumber()
  UPLOAD_RATE_TTL: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
