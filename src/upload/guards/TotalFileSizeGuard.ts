import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TotalFileSizeGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  private readonly maxFileSize =
    this.configService.getOrThrow('TOTAL_FILE_SIZE_PER_REQUEST') || 10000000;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const files: Express.Multer.File[] = request.files;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return true;
    }

    const totalFileSize = files.reduce((acc, file) => acc + file.size, 0);
    const isFileSizeValid = totalFileSize < this.maxFileSize;

    if (!isFileSizeValid) {
      const errorMessage = `Total file size of ${totalFileSize} bytes exceeds the maximum allowed size of ${this.maxFileSize} bytes`;
      throw new BadRequestException(errorMessage);
    }

    return isFileSizeValid;
  }
}
