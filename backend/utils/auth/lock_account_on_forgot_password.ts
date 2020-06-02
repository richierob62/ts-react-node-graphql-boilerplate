import { Redis } from 'ioredis';
import { Response } from 'express';
import { User } from '../../entity/User';
import { removeUserSessions } from './remove_users_sessions';

export const lockAccountOnForgotPassword = async (
  userId: number,
  redis: Redis,
  res: Response
) => {
  await User.update({ id: userId }, { account_locked: true });
  await removeUserSessions(userId, redis, res);
};
