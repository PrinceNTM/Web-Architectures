import { Router } from 'express';
import * as statsService from './stats.service.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const stats = await statsService.getStatsForUser(req.user.userId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;