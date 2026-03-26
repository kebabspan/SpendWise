import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto } from './transactions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Összes tranzakció lekérdezése (dátum szerint csökkenő)' })
  @ApiResponse({ status: 200, description: 'Tranzakciók listája' })
  getAll(@Request() req) {
    return this.transactionsService.findAll(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Új tranzakció létrehozása (egyenleg automatikusan frissül)' })
  @ApiResponse({ status: 201, description: 'Létrehozott tranzakció' })
  @ApiResponse({ status: 400, description: 'Hiányzó számla adatok' })
  create(@Request() req, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(req.user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Tranzakció szerkesztése (összeg változásakor egyenleg is korrigálódik)' })
  @ApiParam({ name: 'id', description: 'Tranzakció ID' })
  @ApiResponse({ status: 200, description: 'Frissített tranzakció' })
  @ApiResponse({ status: 404, description: 'Tranzakció nem található' })
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Tranzakció törlése (egyenleg visszaállítódik)' })
  @ApiParam({ name: 'id', description: 'Tranzakció ID' })
  @ApiResponse({ status: 200, description: 'Törölt tranzakció' })
  @ApiResponse({ status: 404, description: 'Tranzakció nem található' })
  delete(@Request() req, @Param('id') id: string) {
    return this.transactionsService.delete(req.user.userId, id);
  }
}
