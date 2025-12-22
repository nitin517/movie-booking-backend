type Seat = {
  id: number;
  rowNumber: number;
  seatNumber: number;
};

export function findContiguousSeats(
  seats: Seat[],
  groupSize: number
): Seat[] | null {

  // Group seats by row
  const seatsByRow: Record<number, Seat[]> = {};

  for (const seat of seats) {
    if (!seatsByRow[seat.rowNumber]) {
      seatsByRow[seat.rowNumber] = [];
    }
    seatsByRow[seat.rowNumber].push(seat);
  }

  // For each row, sort seats and find window
  for (const row of Object.values(seatsByRow)) {
    row.sort((a, b) => a.seatNumber - b.seatNumber);

    let window: Seat[] = [];

    for (let i = 0; i < row.length; i++) {
      if (
        window.length === 0 ||
        row[i].seatNumber === window[window.length - 1].seatNumber + 1
      ) {
        window.push(row[i]);
      } else {
        window = [row[i]];
      }

      if (window.length === groupSize) {
        return window;
      }
    }
  }

  return null;
}
