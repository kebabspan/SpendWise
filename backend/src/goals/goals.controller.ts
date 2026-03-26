import { Body, Controller, Delete, Get, Param, Patch, Post, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto, AddToGoalDto } from './goals.dto';

@ApiTags('goals')
@ApiBearerAuth()
@Controller('goals')
export class GoalsController {
  constructor(private goalsService: GoalsService) {}

  @Get()
  @ApiOperation({ summary: 'Összes megtakarítási cél lekérdezése' })
  @ApiResponse({ status: 200, description: 'Célok listája' })
  getAll(@Request() req) { return this.goalsService.findAll(req.user.userId); }

  @Post()
  @ApiOperation({ summary: 'Új megtakarítási cél létrehozása' })
  @ApiResponse({ status: 201, description: 'Létrehozott cél' })
  create(@Request() req, @Body() dto: CreateGoalDto) { return this.goalsService.create(req.user.userId, dto); }

  @Patch(':id')
  @ApiOperation({ summary: 'Cél szerkesztése' })
  @ApiParam({ name: 'id', description: 'Cél ID' })
  @ApiResponse({ status: 200, description: 'Frissített cél' })
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateGoalDto) { return this.goalsService.update(req.user.userId, id, dto); }

  @Post(':id/add')
  @ApiOperation({ summary: 'Összeg hozzáadása megtakarítási célhoz' })
  @ApiParam({ name: 'id', description: 'Cél ID' })
  @ApiResponse({ status: 200, description: 'Frissített megtakarítási összeg' })
  addAmount(@Request() req, @Param('id') id: string, @Body() dto: AddToGoalDto) { return this.goalsService.addAmount(req.user.userId, id, dto.amount); }

  @Delete(':id')
  @ApiOperation({ summary: 'Cél törlése' })
  @ApiParam({ name: 'id', description: 'Cél ID' })
  @ApiResponse({ status: 200, description: 'Törölt cél' })
  delete(@Request() req, @Param('id') id: string) { return this.goalsService.delete(req.user.userId, id); }
}
