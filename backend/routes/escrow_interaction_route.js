const express = require('express');
const router = express.Router();
const escrow_interaction = require('../controllers/escrow_interaction');

router.route("/init").post(escrow_interaction.init);
router.route("/list").post(escrow_interaction.list);
router.route("/set_buyer").post(escrow_interaction.set_buyer);
router.route("/set_lender").post(escrow_interaction.set_lender);
router.route("/deposit_earnest").post(escrow_interaction.deposit_earnest);
router.route("/get_balance_in_contract").get(escrow_interaction.get_balance_in_contract);
router.route("/send_amount").post(escrow_interaction.send_amount);
router.route("/finalize_sale").post(escrow_interaction.finalize_sale);
router.route("/loan_repayment").post(escrow_interaction.loan_repayment);

module.exports = router;