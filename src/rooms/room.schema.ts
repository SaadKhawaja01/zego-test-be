import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoomDocument = Room & Document;

@Schema({ timestamps: true })
export class Room {
  @Prop({ required: true }) title: string;
  @Prop() description?: string;
  @Prop({ required: true }) hostId: string;
  @Prop({ required: true, enum: ['audio', 'video'], default: 'video' }) roomType: 'audio' | 'video';
  @Prop({ default: 'open', enum: ['open', 'closed'] }) status: string;
  @Prop({ default: 8 }) maxSeats: number;
  @Prop({ type: Array, default: [] }) seats: any[];
  @Prop({ type: Array, default: [] }) participants: string[];
  @Prop({ type: Date }) closedAt?: Date;
  @Prop({ type: Object, default: {} }) metadata?: Record<string, any>;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
RoomSchema.index({ title: 'text', description: 'text' });
