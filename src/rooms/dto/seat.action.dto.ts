import { IsString } from 'class-validator';

export class SeatActionDto {
  @IsString() action: 'assign' | 'remove' | 'mute' | 'unmute' | 'kick';
  @IsString() targetUserId: string;
}
