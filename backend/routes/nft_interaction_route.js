const express = require('express');
const router = express.Router();
const nft_interaction = require('../controllers/nft_interaction');

router.route("/mint_nft").post(nft_interaction.mint_nft);

module.exports = router;