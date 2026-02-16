import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './transactions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  getAll(@Request() req) {
    return this.transactionsService.findAll(req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(req.user.userId, dto);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.transactionsService.delete(req.user.userId, id);
  }
}