import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto } from './budgets.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Get()
  @ApiOperation({ summary: 'Összes havi büdzsé lekérdezése' })
  @ApiResponse({ status: 200, description: 'Büdzsék listája kategóriával' })
  getAll(@Request() req) {
    return this.budgetsService.findAll(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Új büdzsé létrehozása adott hónapra / kategóriára' })
  @ApiResponse({ status: 201, description: 'Létrehozott büdzsé' })
  @ApiResponse({ status: 409, description: 'Büdzsé már létezik erre a hónapra és kategóriára' })
  create(@Request() req, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(req.user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Büdzsé keretösszeg frissítése' })
  @ApiParam({ name: 'id', description: 'Büdzsé ID' })
  @ApiResponse({ status: 200, description: 'Frissített büdzsé' })
  @ApiResponse({ status: 404, description: 'Büdzsé nem található' })
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateBudgetDto) {
    return this.budgetsService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Büdzsé törlése' })
  @ApiParam({ name: 'id', description: 'Büdzsé ID' })
  @ApiResponse({ status: 200, description: 'Törölt büdzsé' })
  @ApiResponse({ status: 404, description: 'Büdzsé nem található' })
  delete(@Request() req, @Param('id') id: string) {
    return this.budgetsService.delete(req.user.userId, id);
  }
}