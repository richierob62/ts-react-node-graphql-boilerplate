import { Redis } from 'ioredis';
import { v4 } from 'uuid';

export const createForgotPasswordEmailLink = async (
  url: string,
  userId: number,
  redis: Redis
) => {
  const key = v4();
  await redis.set(`p_reset:${key}`, userId, 'ex', 60 * 20);
  return `${url}/reset-password/${key}`;
};
