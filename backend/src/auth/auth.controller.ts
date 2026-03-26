import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { Public } from '../common/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Regisztráció' })
  @ApiResponse({ status: 201, description: 'Sikeres regisztráció, JWT token visszaadva' })
  @ApiResponse({ status: 409, description: 'Email már foglalt' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Bejelentkezés' })
  @ApiResponse({ status: 200, description: 'Sikeres bejelentkezés, JWT token visszaadva' })
  @ApiResponse({ status: 401, description: 'Hibás email vagy jelszó' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}