import {
  Body,
  Controller,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { ResultsService } from './results.service';

@ApiTags('results')
@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @Put('/update-extracted-data/:id')
  async editResults(
    @Param('id') processedDataId: string,
    @Request() req,
    @Body('extractedData')
    updatedExtractedData: any[],
  ) {
    return await this.resultsService.updateResults(
      processedDataId,
      updatedExtractedData,
      req.user.id,
    );
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @Put('/update-rating/:id')
  async updateRating(
    @Param('id') processedDataId: string,
    @Request() req,
    @Body('rating') rating: number,
  ) {
    return await this.resultsService.updateRating(
      processedDataId,
      rating,
      req.user.id,
    );
  }
}
