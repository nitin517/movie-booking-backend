import { Router, Request, Response } from 'express';
import prisma from '../db';
import { generateSeats } from '../services/seatLayout.service';

const router = Router();

/**
 * CREATE HALL
 * (Hall belongs to a Theater)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, theaterId } = req.body;

    const hall = await prisma.hall.create({
      data: {
        name,
        theaterId
      }
    });

    res.status(201).json(hall);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create hall' });
  }
});

/**
 * GET ALL HALLS (with theater info)
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const halls = await prisma.hall.findMany({
      include: {
        theater: true
      }
    });
    res.json(halls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch halls' });
  }
});


/**
 * ADD SEAT LAYOUT TO A HALL
 */
router.post('/:hallId/layout', async (req: Request, res: Response) => {
  try {
    const hallId = Number(req.params.hallId);
    const { rows } = req.body;

    const seatsData = generateSeats(hallId, rows);

    await prisma.seat.createMany({
      data: seatsData
    });

    res.status(201).json({
      message: 'Seat layout created successfully',
      totalSeats: seatsData.length
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
