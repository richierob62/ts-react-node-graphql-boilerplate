import { Redis } from 'ioredis';
import { Response } from 'express';

export const removeUserSessions = async (
  userId: number,
  redis: Redis,
  res: Response
) => {
  const sessionIds = await redis.lrange(`user_sid:${userId}`, 0, -1);

  const promises = [];

  for (let i = 0; i < sessionIds.length; i++) {
    promises.push(redis.del(`sess:${sessionIds[i]}`));
  }

  res.clearCookie(process.env.SESSION_NAME!);

  await Promise.all(promises);
};
