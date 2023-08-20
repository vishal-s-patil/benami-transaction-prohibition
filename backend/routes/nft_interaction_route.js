const express = require('express');
const router = express.Router();
const profile = require('../controllers/nft_interaction');

router.route("/get_user_data").post(profile.get_user_data);
router.route("/upload").post(profile.upload_xml);

module.exports = router;