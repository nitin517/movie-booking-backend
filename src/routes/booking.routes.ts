import { Router, Request, Response } from 'express';
import prisma from '../db';
import { findContiguousSeats } from '../services/groupBooking.service';


//helper functions for chekcing if a show can fit group or not

async function canFitGroup(
  prisma: any,
  showId: number,
  groupSize: number
): Promise<boolean> {

  const show = await prisma.show.findUnique({
    where: { id: showId },
    include: {
      hall: {
        include: { seats: true }
      }
    }
  });

  if (!show) return false;

  const bookedSeats = await prisma.booking.findMany({
    where: { showId },
    select: { seatId: true }
  });

  const bookedSeatIds = new Set(bookedSeats.map(b => b.seatId));

  const availableSeats = show.hall.seats.filter(
    seat => !bookedSeatIds.has(seat.id)
  );

  return !!findContiguousSeats(availableSeats, groupSize);
}


const router = Router();

/**
 * GET SEAT AVAILABILITY FOR A SHOW
 */
router.get('/shows/:showId/seats', async (req: Request, res: Response) => {
  try {
    const showId = Number(req.params.showId);

    // 1. Get show with hall
    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        hall: {
          include: {
            seats: true
          }
        }
      }
    });

    if (!show) {
      return res.status(404).json({ error: 'Show not found' });
    }

    // 2. Get booked seats for this show
    const bookings = await prisma.booking.findMany({
      where: { showId },
      select: { seatId: true }
    });

    const bookedSeatIds = new Set(bookings.map(b => b.seatId));

    // 3. Build seat availability
    const seats = show.hall.seats.map(seat => ({
      id: seat.id,
      rowNumber: seat.rowNumber,
      seatNumber: seat.seatNumber,
      isAisle: seat.isAisle,
      status: bookedSeatIds.has(seat.id) ? 'BOOKED' : 'AVAILABLE'
    }));

    res.json({
      showId,
      hallId: show.hallId,
      seats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch seat availability' });
  }
});


/**
 * BOOK SEATS TOGETHER
 */
router.post('/shows/:showId/book', async (req: Request, res: Response) => {
  const showId = Number(req.params.showId);
  const { groupSize } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {

      // 1. Get show with hall seats
      const show = await tx.show.findUnique({
        where: { id: showId },
        include: {
          hall: {
            include: { seats: true }
          }
        }
      });

      if (!show) throw new Error('Show not found');

      // 2. Get already booked seats
      const bookedSeats = await tx.booking.findMany({
        where: { showId },
        select: { seatId: true }
      });

      const bookedSeatIds = new Set(bookedSeats.map(b => b.seatId));

      // 3. Available seats
      const availableSeats = show.hall.seats.filter(
        seat => !bookedSeatIds.has(seat.id)
      );

      // 4. Find contiguous seats
      const seatsToBook = findContiguousSeats(availableSeats, groupSize);

      if (!seatsToBook) {
        throw new Error('No contiguous seats available');
      }

      // 5. Book seats
      await tx.booking.createMany({
        data: seatsToBook.map(seat => ({
          showId,
          seatId: seat.id
        }))
      });

      return seatsToBook;
    });

    res.status(201).json({
      message: 'Seats booked successfully',
      seats: result
    });

  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});


/**
 * SUGGEST ALTERNATIVE SHOWS
 */
router.get('/shows/:showId/suggestions', async (req: Request, res: Response) => {
  const showId = Number(req.params.showId);
  const groupSize = Number(req.query.groupSize);

  if (!groupSize) {
    return res.status(400).json({ error: 'groupSize is required' });
  }

  try {
    // 1. Get current show
    const currentShow = await prisma.show.findUnique({
      where: { id: showId }
    });

    if (!currentShow) {
      return res.status(404).json({ error: 'Show not found' });
    }

    // 2. Find candidate shows (same movie, different time)
    const candidateShows = await prisma.show.findMany({
      where: {
        movieId: currentShow.movieId,
        NOT: { id: showId }
      },
      orderBy: { startTime: 'asc' }
    });

    const suggestions = [];

    // 3. Check availability for each candidate
    for (const show of candidateShows) {
      const canFit = await canFitGroup(prisma, show.id, groupSize);

      if (canFit) {
        suggestions.push({
          showId: show.id,
          startTime: show.startTime
        });
      }
    }

    res.json({
      message: 'Suggested alternative shows',
      suggestions
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});


export default router;
