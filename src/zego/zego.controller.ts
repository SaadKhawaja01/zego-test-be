import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { ZegoService } from './zego.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface UserRequest extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

@Controller('api/v1/zego')
export class ZegoController {
  constructor(private zegoService: ZegoService) {}

  @UseGuards(JwtAuthGuard)
  @Get('token')
  getToken(@Req() req: UserRequest, @Query('roomId') roomId: string) {
    return this.zegoService.generateToken(req.user.sub, roomId);
  }
}
