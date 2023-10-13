const express = require('express');
const router = express.Router();
const nft_interaction = require('../controllers/nft_interaction');

router.route("/mint_nft").post(nft_interaction.mint_nft);
router.route("/approve").post(nft_interaction.approve);
router.route("/owner_of").post(nft_interaction.owner_of);

module.exports = router;