import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './budgets.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Get()
  getAll(@Request() req) {
    return this.budgetsService.findAll(req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(req.user.userId, dto);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.budgetsService.delete(req.user.userId, id);
  }
}