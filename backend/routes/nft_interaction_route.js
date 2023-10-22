const express = require('express');
const router = express.Router();
const nft_interaction = require('../controllers/nft_interaction');

router.route("/mint_nft").post(nft_interaction.mint_nft);
router.route("/approve").post(nft_interaction.approve);
router.route("/owner_of").post(nft_interaction.owner_of);
router.route("/get_all_owners").get(nft_interaction.get_all_owners);
router.route("/get_owned_nfts").get(nft_interaction.get_owned_nfts);
router.route("/get_ownership_history").get(nft_interaction.get_ownership_history);

module.exports = router;