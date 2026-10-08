const database = require('../services/reservations.service');
const findById = async (id, connection = database) => {
  const [rows] = await connection.execute(`SELECT r.id, r.space_id AS spaceId, r.organization_id AS organizationId,
    o.name AS organization, r.attendees, r.start_at AS startAt, r.end_at AS endAt,
    r.status, r.created_at AS createdAt FROM reservations r
    INNER JOIN organizations o ON o.id = r.organization_id WHERE r.id = ?`, [id]);
  return rows[0] || null;
};
const list = async () => {
  const [rows] = await database.execute(`SELECT r.id, r.space_id AS spaceId, o.name AS organization,
    r.attendees, r.start_at AS startAt, r.end_at AS endAt, r.status
    FROM reservations r INNER JOIN organizations o ON o.id = r.organization_id ORDER BY r.id DESC`);
  return rows;
};
const listOrganizations = async () => {
  const [rows] = await database.execute('SELECT id, name FROM organizations ORDER BY name');
  return rows;
};
const organizationExists = async (id, connection) => {
  const [rows] = await connection.execute('SELECT id FROM organizations WHERE id = ?', [id]);
  return rows.length > 0;
};
const hasOverlap = async (connection, reservation, excludedId = null) => {
  const [rows] = await connection.execute(`SELECT id FROM reservations
    WHERE space_id = ? AND status = 'approved' AND start_at < ? AND end_at > ?
    AND (? IS NULL OR id <> ?) LIMIT 1`,
    [reservation.spaceId, reservation.endAt, reservation.startAt, excludedId, excludedId]);
  return rows.length > 0;
};
const create = async (connection, reservation) => {
  const [result] = await connection.execute(`INSERT INTO reservations
    (space_id, organization_id, attendees, start_at, end_at, status)
    VALUES (?, ?, ?, ?, ?, 'pending')`,
    [reservation.spaceId, reservation.organizationId, reservation.attendees, reservation.startAt, reservation.endAt]);
  return result.insertId;
};
const setStatus = async (connection, id, status) => {
  await connection.execute('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);
};
const addOccupancy = async (connection, reservation) => {
  await connection.execute(`INSERT INTO occupancy_records (reservation_id, space_id, occupied_from, occupied_until, attendees)
    VALUES (?, ?, ?, ?, ?)`,
    [reservation.id, reservation.spaceId, reservation.startAt, reservation.endAt, reservation.attendees]);
};
const removeOccupancy = async (connection, id) => {
  await connection.execute('DELETE FROM occupancy_records WHERE reservation_id = ?', [id]);
};
module.exports = { findById, list, listOrganizations, organizationExists, hasOverlap, create, setStatus, addOccupancy, removeOccupancy };
