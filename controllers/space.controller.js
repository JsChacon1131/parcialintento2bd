const spaceDao = require('../dao/space.dao');
const { requiredText, positiveInteger } = require('../utils/validators');
const HttpError = require('../utils/http-error');
const list = async (request, response) => response.json(await spaceDao.list());
const listUnits = async (request, response) => response.json(await spaceDao.listUnits());
const getById = async (request, response) => {
  const space = await spaceDao.findById(positiveInteger(request.params.id, 'spaceId'));
  if (!space) throw new HttpError(404, 'Cultural space not found');
  response.json(space);
};
const create = async (request, response) => {
  const input = request.body || {};
  const conservationStatus = requiredText(input.conservationStatus, 'conservationStatus', 30);
  if (!['operational', 'maintenance', 'closed'].includes(conservationStatus)) {
    throw new HttpError(400, 'Invalid conservationStatus');
  }
  const space = {
    name: requiredText(input.name, 'name'),
    address: requiredText(input.address, 'address', 255),
    maximumCapacity: positiveInteger(input.maximumCapacity, 'maximumCapacity'),
    conservationStatus,
    administrativeUnitId: positiveInteger(input.administrativeUnitId, 'administrativeUnitId')
  };
  const id = await spaceDao.create(space);
  response.status(201).json({ id, ...space });
};
module.exports = { list, listUnits, getById, create };
