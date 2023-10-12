const express = require('express');
const router = express.Router();
const property = require('../controllers/property')
const nft = require('../controllers/nft_interaction')

router.route("/add_property").post(nft.mint_nft);
router.route("/get_properties").get(property.get_properties);

module.exports = router;