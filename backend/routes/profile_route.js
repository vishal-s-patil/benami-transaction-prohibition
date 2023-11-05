const express = require('express');
const router = express.Router();
const profile = require('../controllers/profile');

router.route("/get_user_data").get(profile.get_user_data);
router.route("/upload").post(profile.upload_xml);
router.route("/get_user_requests").get(profile.get_user_requests);
router.route("/remove_user_request").post(profile.remove_user_request);
router.route("/add_user_request").post(profile.add_user_request);
router.route("/get_lenders").get(profile.get_lenders);
router.route("/add_lenders").post(profile.add_lenders);
router.route("/pay_loan").post(profile.pay_loan);

module.exports = router;