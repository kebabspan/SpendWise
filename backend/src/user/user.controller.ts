import { Body, Controller, Get, Patch, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Saját profil lekérdezése' })
  @ApiResponse({ status: 200, description: 'Felhasználói adatok' })
  getMe(@Request() req) {
    return this.userService.getMe(req.user.userId);
  }

  @Patch('update')
  @ApiOperation({ summary: 'Profil frissítése (név, jelszó, valuta)' })
  @ApiResponse({ status: 200, description: 'Frissített felhasználói adatok' })
  updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
    return this.userService.updateProfile(req.user.userId, dto);
  }
}