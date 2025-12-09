import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRoomDto } from './dto/create.room.dto';
import { JoinRoomDto } from './dto/join.room.dto';
import { SeatActionDto } from './dto/seat.action.dto';
import { PromoteDemoteDto } from './dto/promote.demote.dto';

interface UserRequest extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

@Controller('api/v1/rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createRoom(@Req() req: UserRequest, @Body() body: CreateRoomDto) {
    return this.roomsService.createRoom({ ...body, hostId: req.user.sub });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  listRooms(@Query() query: Record<string, string>) {
    return this.roomsService.listRooms(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getRoom(@Param('id') id: string) {
    return this.roomsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/close')
  closeRoom(@Req() req: UserRequest, @Param('id') id: string) {
    return this.roomsService.closeRoom(id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  joinRoom(
    @Req() req: UserRequest,
    @Param('id') roomId: string,
    @Body() body: JoinRoomDto,
  ) {
    return this.roomsService.addParticipant(roomId, {
      userId: req.user.sub,
      displayName: body.displayName,
      role: 'audience',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/leave')
  leaveRoom(@Req() req: UserRequest, @Param('id') roomId: string) {
    return this.roomsService.removeParticipant(roomId, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/seats/:index')
  updateSeat(
    @Req() req: UserRequest,
    @Param('id') roomId: string,
    @Param('index') index: number,
    @Body() body: SeatActionDto,
  ) {
    return this.roomsService.updateSeat(
      roomId,
      index,
      body.action,
      body.targetUserId,
      req.user.sub,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/role')
  promoteDemote(
    @Req() req: UserRequest,
    @Param('id') roomId: string,
    @Body() body: PromoteDemoteDto,
  ) {
    return this.roomsService.promoteDemoteUser(
      roomId,
      body.targetUserId,
      body.role,
      req.user.sub,
    );
  }
}
