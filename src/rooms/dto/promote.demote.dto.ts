import { IsString } from 'class-validator';

export class PromoteDemoteDto {
  @IsString() role: 'audience' | 'moderator';
  @IsString() targetUserId: string;
}
