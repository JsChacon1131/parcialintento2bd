const database = require('./reservations.service');
const spaceDao = require('../dao/space.dao');
const reservationDao = require('../dao/reservation.dao');
const HttpError = require('../utils/http-error');

const checkSpace = async (spaceId, attendees) => {
  const space = await spaceDao.findById(spaceId);
  if (!space) throw new HttpError(404, 'Cultural space not found');
  if (space.conservation_status !== 'operational') throw new HttpError(409, 'Cultural space is not operational');
  if (attendees > space.maximum_capacity) throw new HttpError(409, 'Requested attendees exceed maximum capacity');
};

const withSpaceLock = async (spaceId, action) => {
  const connection = await database.getConnection();
  const lockName = `cultural_space_${spaceId}`;
  let locked = false;
  try {
    const [rows] = await connection.query('SELECT GET_LOCK(?, 10) AS acquired', [lockName]);
    if (rows[0].acquired !== 1) throw new HttpError(503, 'Space is temporarily busy');
    locked = true;
    await connection.beginTransaction();
    const result = await action(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    if (locked) await connection.query('SELECT RELEASE_LOCK(?)', [lockName]);
    connection.release();
  }
};

const submit = async (reservation) => withSpaceLock(reservation.spaceId, async (connection) => {
  await checkSpace(reservation.spaceId, reservation.attendees);
  if (!await reservationDao.organizationExists(reservation.organizationId, connection)) {
    throw new HttpError(404, 'Organization not found');
  }
  if (await reservationDao.hasOverlap(connection, reservation)) {
    throw new HttpError(409, 'An approved reservation overlaps this schedule');
  }
  const id = await reservationDao.create(connection, reservation);
  return { id, status: 'pending' };
});

const updateStatus = async (id, status) => {
  const current = await reservationDao.findById(id);
  if (!current) throw new HttpError(404, 'Reservation not found');
  return withSpaceLock(current.spaceId, async (connection) => {
    const reservation = await reservationDao.findById(id, connection);
    if (!reservation) throw new HttpError(404, 'Reservation not found');
    if (reservation.status === 'cancelled' || reservation.status === 'rejected') {
      throw new HttpError(409, 'This reservation can no longer change status');
    }
    if (status === 'approved') {
      if (reservation.status === 'approved') return { id, status };
      await checkSpace(reservation.spaceId, reservation.attendees);
      if (await reservationDao.hasOverlap(connection, reservation, id)) {
        throw new HttpError(409, 'An approved reservation overlaps this schedule');
      }
      await reservationDao.addOccupancy(connection, { ...reservation, id });
    }
    if (reservation.status === 'approved' && status !== 'approved') {
      await reservationDao.removeOccupancy(connection, id);
    }
    await reservationDao.setStatus(connection, id, status);
    return { id, status };
  });
};
module.exports = { submit, updateStatus };
