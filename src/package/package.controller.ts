import { Controller, Get, Request, Patch, Param } from '@nestjs/common';
import { PackageService } from './package.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { UpdatePackageNameDto } from './dto/update-package.dto';

@ApiTags('package')
@Controller('package')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @UseGuards(AuthGuard)
  @Get('/get-packages')
  @ApiBearerAuth('access-token')
  async getUserPackages(@Request() req) {
    const getPackages = await this.packageService.getUserPackagesAndResults(
      req.user.id,
    );
    return getPackages;
  }

  @UseGuards(AuthGuard)
  @Patch('/edit-package-name/:id')
  @ApiBearerAuth('access-token')
  async editPackageName(@Request() req, @Param('id') id: string) {
    const editPackageName = await this.packageService.editPackageName(
      req.user.id,
      id,
      req.body.packageName,
    );
    return editPackageName;
  }

  @UseGuards(AuthGuard)
  @Get('/get-package/:id')
  @ApiBearerAuth('access-token')
  async getPackage(@Request() req, @Param('id') id: string) {
    const getPackage = await this.packageService.getPackage(req.user.id, id);
    return getPackage;
  }
}
