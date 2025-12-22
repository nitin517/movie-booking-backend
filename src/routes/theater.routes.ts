import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

/**
 * CREATE THEATER
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, city } = req.body;

    const theater = await prisma.theater.create({
      data: { name, city }
    });

    res.status(201).json(theater);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create theater' });
  }
});

/**
 * GET ALL THEATERS
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const theaters = await prisma.theater.findMany();
    res.json(theaters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch theaters' });
  }
});

export default router;
