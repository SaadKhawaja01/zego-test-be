import { Module } from '@nestjs/common';
import { ZegoController } from './zego.controller';
import { ZegoService } from './zego.service';

@Module({
  controllers: [ZegoController],
  providers: [ZegoService],
})
export class ZegoModule {}
