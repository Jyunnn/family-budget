import { Router, Response } from 'express';

const router = Router();

router.get('/', (_req: any, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

export default router;
