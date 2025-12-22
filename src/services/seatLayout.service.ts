type RowConfig = {
  rowNumber: number;
  seatCount: number;
};

export function generateSeats(
  hallId: number,
  rows: RowConfig[]
) {
  const seats = [];

  for (const row of rows) {
    if (row.seatCount < 6) {
      throw new Error(`Row ${row.rowNumber} must have at least 6 seats`);
    }

    for (let seatNo = 1; seatNo <= row.seatCount; seatNo++) {
      seats.push({
        hallId,
        rowNumber: row.rowNumber,
        seatNumber: seatNo,
        isAisle: seatNo <= 6
      });
    }
  }

  return seats;
}
