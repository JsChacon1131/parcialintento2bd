require('dotenv').config();
const express = require('express');
const path = require('path');
const asyncHandler = require('./utils/async-handler');
const spaceDao = require('./dao/space.dao');
const reservationDao = require('./dao/reservation.dao');
const spaceRoutes = require('./routes/space.routes');
const reservationRoutes = require('./routes/reservation.routes');

const app = express();
app.use(express.json({ limit: '16kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/spaces', spaceRoutes);
app.use('/api/reservations', reservationRoutes);
app.get('/api/administrative-units', asyncHandler(async (req, res) => res.json(await spaceDao.listUnits())));
app.get('/api/organizations', asyncHandler(async (req, res) => res.json(await reservationDao.listOrganizations())));
app.use((req, res) => res.status(404).json({ error: 'Resource not found' }));
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400) return res.status(400).json({ error: 'Invalid JSON' });
  if (error.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'Referenced record does not exist' });
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Record already exists' });
  if (error.code === 'ER_BAD_DB_ERROR' || error.code === 'ECONNREFUSED') return res.status(503).json({ error: 'Database unavailable' });
  if (!error.status) console.error(error);
  return res.status(error.status || 500).json({ error: error.status ? error.message : 'Internal server error' });
});
if (require.main === module) app.listen(Number(process.env.PORT || 5000), () => console.log('Server started'));
module.exports = app;
