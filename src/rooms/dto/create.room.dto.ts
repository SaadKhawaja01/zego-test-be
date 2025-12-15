import { IsString, IsOptional, IsNumber, Max, Min, IsEnum } from 'class-validator';

export class CreateRoomDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsEnum(['audio', 'video'], { message: 'roomType must be either audio or video' })
  roomType: 'audio' | 'video';
  @IsOptional() @IsNumber() @Min(1) @Max(16) maxSeats?: number;
}
