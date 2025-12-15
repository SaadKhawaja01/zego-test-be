import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Room, RoomSchema } from './room.schema';
import { Participant, ParticipantSchema } from './participant.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: Participant.name, schema: ParticipantSchema },

    ]),
  ],
  providers: [RoomsService],
  controllers: [RoomsController],
})
export class RoomsModule {}
