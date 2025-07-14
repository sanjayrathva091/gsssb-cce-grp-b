const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), uploadController.uploadFile);

router.post('/updateMainsMarks', uploadController.estimateMainsMarks);

router.get('/getCandidate/:prelimRollNo', uploadController.getCandidate);

router.get('/fetchData', uploadController.fetchData);
module.exports = router;