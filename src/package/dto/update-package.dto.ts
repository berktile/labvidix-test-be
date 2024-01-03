import { IsString, IsNotEmpty } from 'class-validator';

export class UpdatePackageNameDto {
  @IsString()
  @IsNotEmpty()
  packageName: string;

  @IsString()
  @IsNotEmpty()
  id: string;
}
