"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userControler_1 = require("../controllers/userControler");
const balanceController_1 = require("../controllers/balanceController");
const router = (0, express_1.Router)();
router.use(userControler_1.protect);
router.get('/check', balanceController_1.checkBalance);
exports.default = router;
