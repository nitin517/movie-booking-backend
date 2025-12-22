import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

/**
 * CREATE MOVIE
 */
router.post('/', async (req: Request, res: Response) => {
  try {
      const { name, duration, price } = req.body;
       if (!name || !duration || !price) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const movie = await prisma.movie.create({
      data: {
        name,
        duration,
        price
      }
    });

    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create movie' });
  }
});

/**
 * GET ALL MOVIES
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const movies = await prisma.movie.findMany();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

export default router;
