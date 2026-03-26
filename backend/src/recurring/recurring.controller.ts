import { Body, Controller, Delete, Get, Param, Patch, Post, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RecurringService } from './recurring.service';
import { CreateRecurringDto, UpdateRecurringDto } from './recurring.dto';

@ApiTags('recurring')
@ApiBearerAuth()
@Controller('recurring')
export class RecurringController {
  constructor(private recurringService: RecurringService) {}

  @Get()
  @ApiOperation({ summary: 'Összes ismétlődő tranzakció lekérdezése' })
  @ApiResponse({ status: 200, description: 'Ismétlődők listája' })
  getAll(@Request() req) { return this.recurringService.findAll(req.user.userId); }

  @Post('process')
  @ApiOperation({ summary: 'Lejárt ismétlődő tranzakciók feldolgozása (automatikus tranzakció-generálás)' })
  @ApiResponse({ status: 200, description: 'Feldolgozott tranzakciók száma' })
  process(@Request() req) { return this.recurringService.processRecurring(req.user.userId); }

  @Post()
  @ApiOperation({ summary: 'Új ismétlődő tranzakció létrehozása' })
  @ApiResponse({ status: 201, description: 'Létrehozott ismétlődő tranzakció' })
  create(@Request() req, @Body() dto: CreateRecurringDto) { return this.recurringService.create(req.user.userId, dto); }

  @Patch(':id')
  @ApiOperation({ summary: 'Ismétlődő tranzakció szerkesztése' })
  @ApiParam({ name: 'id', description: 'Ismétlődő ID' })
  @ApiResponse({ status: 200, description: 'Frissített ismétlődő tranzakció' })
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateRecurringDto) { return this.recurringService.update(req.user.userId, id, dto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Ismétlődő tranzakció törlése' })
  @ApiParam({ name: 'id', description: 'Ismétlődő ID' })
  @ApiResponse({ status: 200, description: 'Törölt ismétlődő tranzakció' })
  delete(@Request() req, @Param('id') id: string) { return this.recurringService.delete(req.user.userId, id); }
}
