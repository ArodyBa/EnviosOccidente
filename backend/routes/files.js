const express = require('express');
const multer = require('multer');
const ctrl = require('../controllers/filesController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), ctrl.upload);
router.delete('/:id', ctrl.remove);

module.exports = router;
