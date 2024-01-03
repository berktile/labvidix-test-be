import { Injectable } from '@nestjs/common';

@Injectable()
export class FileNameFilter {
  filterFileName(fileName: string): string {
    const validCharacters = /[a-zA-Z0-9\-_\.~]/;
    const cleanedFileName = fileName
      .split('')
      .map((char) => (char.match(validCharacters) ? char : ''))
      .join('');

    return cleanedFileName;
  }
}
