const byId = (id) => document.getElementById(id);
const notice = (message) => { byId('message').textContent = message; };
const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'La operación falló');
  return result;
};
const requestOptions = (method, data) => ({
  method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
});
const formValues = (form) => Object.fromEntries(new FormData(form).entries());
const addCell = (row, value) => {
  const cell = document.createElement('td');
  cell.textContent = String(value);
  row.appendChild(cell);
};
const renderTable = (id, items, columns) => {
  const body = byId(id);
  body.replaceChildren();
  for (const item of items) {
    const row = document.createElement('tr');
    for (const column of columns) addCell(row, item[column]);
    body.appendChild(row);
  }
};
const fillSelect = (id, rows, labelKey) => {
  const select = byId(id);
  select.replaceChildren();
  for (const row of rows) {
    const option = document.createElement('option');
    option.value = row.id;
    option.textContent = row[labelKey];
    select.appendChild(option);
  }
};
const refresh = async () => {
  const [spaces, reservations, units, organizations] = await Promise.all([
    requestJson('/api/spaces'), requestJson('/api/reservations'),
    requestJson('/api/administrative-units'), requestJson('/api/organizations')
  ]);
  fillSelect('spaceSelect', spaces.filter((space) => space.conservationStatus === 'operational'), 'name');
  fillSelect('unitSelect', units, 'name');
  fillSelect('organizationSelect', organizations, 'name');
  renderTable('spaceRows', spaces, ['id', 'name', 'maximumCapacity', 'conservationStatus']);
  renderTable('reservationRows', reservations, ['id', 'spaceId', 'organization', 'attendees', 'status']);
};
const submitForm = (id, url, method, successMessage) => {
  byId(id).addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const data = formValues(event.currentTarget);
      const result = await requestJson(typeof url === 'function' ? url(data) : url, requestOptions(method, data));
      notice(`${successMessage}. ID: ${result.id}`);
      event.currentTarget.reset();
      await refresh();
    } catch (error) { notice(error.message); }
  });
};
submitForm('spaceForm', '/api/spaces', 'POST', 'Espacio creado');
submitForm('reservationForm', '/api/reservations', 'POST', 'Solicitud registrada');
submitForm('statusForm', (data) => `/api/reservations/${encodeURIComponent(data.reservationId)}`, 'PATCH', 'Estado actualizado');
byId('searchForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const { reservationId } = formValues(event.currentTarget);
  try {
    const reservation = await requestJson(`/api/reservations/${encodeURIComponent(reservationId)}`);
    byId('reservationDetail').textContent = `Reserva #${reservation.id}: ${reservation.status}. Organización: ${reservation.organization}. Aforo: ${reservation.attendees}.`;
  } catch (error) { notice(error.message); }
});
refresh().catch((error) => notice(`No fue posible cargar los datos: ${error.message}`));
