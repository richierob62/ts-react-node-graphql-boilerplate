import { Redis } from 'ioredis';
import { Response } from 'express';

export const removeUserSessions = async (
  userId: number,
  redis: Redis,
  res: Response
) => {
  await redis.del([`user_sid:${userId}`]);
  res.clearCookie(process.env.SESSION_NAME!);
};
