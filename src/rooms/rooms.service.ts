import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './room.schema';

import { Participant } from './participant.schema';


interface CreateRoomPayload {
  title: string;
  description?: string;
  roomType: 'audio' | 'video';
  maxSeats?: number;
  hostId: string;
}

interface ParticipantData {
  userId: string;
  displayName: string;
  participantType: 'audio' | 'video';
  role?: string;
}

export interface Seat {
  index: number;
  occupied: boolean;
  userId?: string;
  muted?: boolean;
}

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(Participant.name) private participantModel: Model<Participant>,

  ) {}

  async createRoom(payload: CreateRoomPayload) {
    if (!payload.title || !payload.hostId || !payload.roomType) {
      throw new BadRequestException('Title, hostId, and roomType are required');
    }
    if (!['audio', 'video'].includes(payload.roomType)) {
      throw new BadRequestException('roomType must be either audio or video');
    }
    const maxSeats = payload.maxSeats || 8;
    if (maxSeats < 1 || maxSeats > 16) {
      throw new BadRequestException('maxSeats must be between 1 and 16');
    }
    const doc = new this.roomModel({
      ...payload,
      seats: Array.from({ length: maxSeats }, (_, i) => ({
        index: i,
        occupied: false,
      })),
    });
    return doc.save();
  }

  async listRooms(filter: Record<string, string>) {
    const { q = '', status, page = '0', limit = '20' } = filter;
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (q) query.$text = { $search: q };
    const skip = Number(page) * Number(limit);
    const items = await this.roomModel
      .find(query)
      .skip(skip)
      .limit(Number(limit))
      .lean();
    const total = await this.roomModel.countDocuments(query);
    return { items, total, page: Number(page), limit: Number(limit) };
  }

  async findById(id: string) {
    const room = await this.roomModel.findById(id).lean();
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async closeRoom(roomId: string, actorUserId: string) {
    const room = await this.roomModel.findById(roomId);
    if (!room) throw new NotFoundException('Room not found');
    if (room.hostId !== actorUserId) {
      throw new ForbiddenException('Only host can close room');
    }
    room.status = 'closed';
    room.closedAt = new Date();
    await room.save();

    return room;
  }

  async addParticipant(roomId: string, data: ParticipantData) {
    const room = await this.roomModel.findById(roomId);
    if (!room) throw new NotFoundException('Room not found');
    const existing = await this.participantModel.findOne({
      roomId,
      userId: data.userId,
    });
    if (existing) return existing;
    const participant = new this.participantModel({ roomId, ...data });
    await this.roomModel.updateOne(
      { _id: roomId },
      { $push: { participants: data.userId } },
    );
    return participant.save();
  }

  async removeParticipant(roomId: string, userId: string) {
    const room = await this.roomModel.findById(roomId);
    if (!room) throw new NotFoundException('Room not found');
    const participant = await this.participantModel.findOne({ roomId, userId });
    if (!participant) throw new NotFoundException('Participant not found');
    await this.participantModel.deleteOne({ roomId, userId });
    await this.roomModel.updateOne(
      { _id: roomId },
      { $pull: { participants: userId } },
    );
    return { success: true, message: 'Participant removed' };
  }

  async updateSeat(
    roomId: string,
    index: number,
    action: string,
    targetUserId: string,
    actorUserId: string,
  ) {
    const room = await this.roomModel.findById(roomId);
    if (!room) throw new NotFoundException('Room not found');
    const seat = room.seats[index] as Seat | undefined;
    if (!seat) throw new BadRequestException('Invalid seat index');

    const actor = await this.participantModel.findOne({
      roomId,
      userId: actorUserId,
    });
    const isHost = room.hostId === actorUserId;
    const isMod = actor?.role === 'moderator';

    if (!isHost && !isMod) {
      throw new ForbiddenException('Only host/moderator can update seats');
    }

    switch (action) {
      case 'assign': {
        const targetParticipant = await this.participantModel.findOne({
          roomId,
          userId: targetUserId,
        });
        if (!targetParticipant) {
          throw new NotFoundException('Target user is not a participant');
        }
        seat.occupied = true;
        seat.userId = targetUserId;
        break;
      }
      case 'remove': {
        seat.occupied = false;
        seat.userId = undefined;
        break;
      }
      case 'mute': {
        seat.muted = true;
        break;
      }
      case 'unmute': {
        seat.muted = false;
        break;
      }
      case 'kick': {
        seat.occupied = false;
        seat.userId = undefined;
        await this.participantModel.deleteOne({ roomId, userId: targetUserId });
        break;
      }
      default: {
        throw new BadRequestException('Unknown action');
      }
    }
    room.markModified('seats');
    await room.save();

    return seat;
  }

  async promoteDemoteUser(
    roomId: string,
    targetUserId: string,
    role: string,
    actorUserId: string,
  ) {
    const room = await this.roomModel.findById(roomId);
    if (!room) throw new NotFoundException('Room not found');
    if (room.hostId !== actorUserId) {
      throw new ForbiddenException('Only host can promote/demote');
    }
    const participant = await this.participantModel.findOne({
      roomId,
      userId: targetUserId,
    });
    if (!participant) throw new NotFoundException('Participant not found');
    participant.role = role;
    await participant.save();

    return participant;
  }
}
