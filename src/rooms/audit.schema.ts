import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class AuditLog {
  @Prop() roomId: string;
  @Prop() userId: string;
  @Prop() action: string;
  @Prop({ type: Object }) payload: any;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
