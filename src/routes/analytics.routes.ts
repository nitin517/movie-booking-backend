import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

/**
 * GET MOVIE ANALYTICS
 * tickets sold + GMV for a time range
 */
router.get('/movies/:movieId', async (req: Request, res: Response) => {
  const movieId = Number(req.params.movieId);
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({
      error: 'from and to query params are required'
    });
  }

  try {
    // 1. Fetch movie (for price)
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // 2. Find shows in time range
    const shows = await prisma.show.findMany({
      where: {
        movieId,
        startTime: {
          gte: new Date(from as string),
          lte: new Date(to as string)
        }
      },
      select: { id: true }
    });

    const showIds = shows.map(s => s.id);

    if (showIds.length === 0) {
      return res.json({
        movieId,
        ticketsSold: 0,
        gmv: 0
      });
    }

    // 3. Count bookings
    const ticketsSold = await prisma.booking.count({
      where: {
        showId: { in: showIds }
      }
    });

    // 4. Calculate GMV
    const gmv = ticketsSold * movie.price;

    res.json({
      movieId,
      movieName: movie.name,
      ticketsSold,
      gmv
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
