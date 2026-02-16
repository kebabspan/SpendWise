import { Body, Controller, Get, Patch, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // Csak bejelentkezve érhető el
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@Request() req) {
    // A req.user-t a JwtStrategy teszi bele a token alapján
    return this.userService.getMe(req.user.userId);
  }

  @Patch('update')
  updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
    return this.userService.updateProfile(req.user.userId, dto);
  }
}