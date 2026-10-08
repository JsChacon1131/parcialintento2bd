const reservationDao = require('../dao/reservation.dao');
const reservationService = require('../services/reservation.service');
const { positiveInteger, dateTime, requiredText } = require('../utils/validators');
const HttpError = require('../utils/http-error');
const list = async (request, response) => response.json(await reservationDao.list());
const listOrganizations = async (request, response) => response.json(await reservationDao.listOrganizations());
const getById = async (request, response) => {
  const reservation = await reservationDao.findById(positiveInteger(request.params.id, 'reservationId'));
  if (!reservation) throw new HttpError(404, 'Reservation not found');
  response.json(reservation);
};
const create = async (request, response) => {
  const input = request.body || {};
  const reservation = {
    spaceId: positiveInteger(input.spaceId, 'spaceId'),
    organizationId: positiveInteger(input.organizationId, 'organizationId'),
    attendees: positiveInteger(input.attendees, 'attendees'),
    startAt: dateTime(input.startAt, 'startAt'),
    endAt: dateTime(input.endAt, 'endAt')
  };
  if (reservation.startAt >= reservation.endAt) throw new HttpError(400, 'End must be after start');
  response.status(201).json(await reservationService.submit(reservation));
};
const updateStatus = async (request, response) => {
  const id = positiveInteger(request.params.id, 'reservationId');
  const status = requiredText(request.body?.status, 'status', 20);
  if (!['approved', 'rejected', 'cancelled'].includes(status)) throw new HttpError(400, 'Invalid status');
  response.json(await reservationService.updateStatus(id, status));
};
module.exports = { list, listOrganizations, getById, create, updateStatus };
