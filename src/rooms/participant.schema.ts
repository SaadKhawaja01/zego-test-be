import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Participant {
  @Prop({ required: true }) roomId: string;
  @Prop({ required: true }) userId: string;
  @Prop() displayName: string;
  @Prop({ default: 'audience' }) role: string;
  @Prop({ default: false }) isMuted: boolean;
  @Prop({ default: Date.now }) joinedAt: Date;
  @Prop() leftAt?: Date;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);
ParticipantSchema.index({ roomId: 1, userId: 1 }, { unique: true });
