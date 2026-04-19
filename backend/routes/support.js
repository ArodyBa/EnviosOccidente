const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/supportController");

router.get("/conversations", ctrl.listConversations);
router.get("/conversations/:id/messages", ctrl.getMessages);
router.post("/conversations/:id/claim", ctrl.claimConversation);
router.post("/conversations/:id/close", ctrl.closeConversation);
router.post("/conversations/:id/messages", ctrl.sendMessage);

module.exports = router;

