import { IsString, IsOptional, IsNumber, Max, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() @Min(1) @Max(16) maxSeats?: number;
}
