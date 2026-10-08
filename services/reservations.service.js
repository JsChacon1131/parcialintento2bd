const mysql = require('mysql2/promise');
module.exports = mysql.createPool(require('../config/reservations.config'));
