import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ZegoService {
  generateToken(userId: string, roomId: string) {
    const appId = process.env.ZEGO_APP_ID;
    const serverSecret = process.env.ZEGO_APP_SIGN || '';
    const timestamp = Math.floor(Date.now() / 1000) + 600; // 10 mins
    const nonce = Math.floor(Math.random() * 100000);
    const message = `${appId}${roomId}${userId}${timestamp}${nonce}`;
    const hash = crypto
      .createHmac('sha256', serverSecret)
      .update(message)
      .digest('hex');
    return { token: hash, timestamp, nonce, userId, roomId };
  }
}
