const express = require('express');
const router = express.Router()

const dummy = require('../controllers/api')

router.route("/").get(dummy.demo);

module.exports = router;