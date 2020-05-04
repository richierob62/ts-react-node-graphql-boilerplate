import { Redis } from 'ioredis';

export const removeUserSessions = async (userId: number, redis: Redis) => {
  const sessionIds = await redis.lrange(`user_sid:${userId}`, 0, -1);

  const promises = [];

  for (let i = 0; i < sessionIds.length; i++) {
    promises.push(redis.del(`sess:${sessionIds[i]}`));
  }

  await Promise.all(promises);
};
