import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto } from './accounts.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Összes számla lekérdezése' })
  @ApiResponse({ status: 200, description: 'Számlák listája' })
  getAll(@Request() req) {
    return this.accountsService.findAll(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Új számla létrehozása' })
  @ApiResponse({ status: 201, description: 'Létrehozott számla' })
  create(@Request() req, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(req.user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Számla frissítése' })
  @ApiParam({ name: 'id', description: 'Számla ID' })
  @ApiResponse({ status: 200, description: 'Frissített számla' })
  @ApiResponse({ status: 404, description: 'Számla nem található' })
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.accountsService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Számla törlése' })
  @ApiParam({ name: 'id', description: 'Számla ID' })
  @ApiResponse({ status: 200, description: 'Törölt számla' })
  @ApiResponse({ status: 404, description: 'Számla nem található' })
  delete(@Request() req, @Param('id') id: string) {
    return this.accountsService.delete(req.user.userId, id);
  }
}