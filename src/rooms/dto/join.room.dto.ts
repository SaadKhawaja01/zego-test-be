import { IsString, IsEnum } from 'class-validator';

export class JoinRoomDto {
  @IsString() displayName: string;
  @IsEnum(['audio', 'video'], { message: 'participantType must be either audio or video' })
  participantType: 'audio' | 'video';
}
