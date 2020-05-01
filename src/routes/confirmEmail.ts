import { Request, Response } from 'express';

import { User } from '../entity/User';
import redis from '../utils/redis';

export const confirmEmail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = await redis.get(id);
  if (!userId) return res.send('invalid');
  await User.update({ id: parseInt(userId) }, { confirmed: true });
  await redis.del(id);
  return res.send('ok'); // or redirect
};
