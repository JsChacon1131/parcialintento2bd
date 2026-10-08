const database = require('../services/patrimony.service');
const list = async () => {
  const [rows] = await database.execute(`SELECT s.id, s.name, s.address, s.maximum_capacity AS maximumCapacity,
    s.conservation_status AS conservationStatus, s.administrative_unit_id AS administrativeUnitId,
    u.name AS administrativeUnit FROM cultural_spaces s
    INNER JOIN administrative_units u ON u.id = s.administrative_unit_id ORDER BY s.id DESC`);
  return rows;
};
const findById = async (id) => {
  const [rows] = await database.execute('SELECT * FROM cultural_spaces WHERE id = ?', [id]);
  return rows[0] || null;
};
const create = async (space) => {
  const [result] = await database.execute(
    'INSERT INTO cultural_spaces (name, address, maximum_capacity, conservation_status, administrative_unit_id) VALUES (?, ?, ?, ?, ?)',
    [space.name, space.address, space.maximumCapacity, space.conservationStatus, space.administrativeUnitId]
  );
  return result.insertId;
};
const listUnits = async () => {
  const [rows] = await database.execute('SELECT id, name FROM administrative_units ORDER BY name');
  return rows;
};
module.exports = { list, findById, create, listUnits };
