import express from 'express';
import movieRoutes from './routes/movies.routes';
import theaterRoutes from './routes/theater.routes';
import hallRoutes from './routes/hall.routes';
import showRoutes from './routes/show.routes';
import bookingRoutes from './routes/booking.routes';
import analyticsRoutes from './routes/analytics.routes';



const app = express();
app.use(express.json());

app.use('/movies', movieRoutes);
app.use('/theaters', theaterRoutes);
app.use('/shows', showRoutes);
app.use('/halls', hallRoutes);
app.use('/bookings', bookingRoutes);
app.use('/analytics', analyticsRoutes);



app.get('/', (_req, res) => {
  res.send('Movie Booking Backend running');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
