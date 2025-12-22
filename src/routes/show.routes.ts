import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

/**
 * CREATE SHOW
 * movieId + hallId + startTime
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { movieId, hallId, startTime } = req.body;

    const show = await prisma.show.create({
      data: {
        movieId,
        hallId,
        startTime: new Date(startTime)
      }
    });

    res.status(201).json(show);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create show' });
  }
});

/**
 * GET ALL SHOWS
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const shows = await prisma.show.findMany({
      include: {
        movie: true,
        hall: true
      }
    });

    res.json(shows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shows' });
  }
});

export default router;
