const router = require('express').Router();
const controller = require('../controllers/reservation.controller');
const handle = require('../utils/async-handler');
router.get('/', handle(controller.list));
router.get('/:id', handle(controller.getById));
router.post('/', handle(controller.create));
router.patch('/:id', handle(controller.updateStatus));
module.exports = router;
