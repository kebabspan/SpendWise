import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Összes kategória lekérdezése' })
  @ApiResponse({ status: 200, description: 'Kategóriák listája' })
  getAll(@Request() req) {
    return this.categoriesService.findAll(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Új kategória létrehozása' })
  @ApiResponse({ status: 201, description: 'Létrehozott kategória' })
  @ApiResponse({ status: 409, description: 'Kategória már létezik ezzel a névvel és típussal' })
  create(@Request() req, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(req.user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Kategória frissítése' })
  @ApiParam({ name: 'id', description: 'Kategória ID' })
  @ApiResponse({ status: 200, description: 'Frissített kategória' })
  @ApiResponse({ status: 404, description: 'Kategória nem található' })
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kategória törlése' })
  @ApiParam({ name: 'id', description: 'Kategória ID' })
  @ApiResponse({ status: 200, description: 'Törölt kategória' })
  @ApiResponse({ status: 404, description: 'Kategória nem található' })
  delete(@Request() req, @Param('id') id: string) {
    return this.categoriesService.delete(req.user.userId, id);
  }
}