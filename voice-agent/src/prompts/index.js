"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrompt = exports.PROMPTS = void 0;
const real_estate_1 = require("./real-estate");
const cart_recovery_1 = require("./cart-recovery");
const edtech_1 = require("./edtech");
exports.PROMPTS = {
    'vikas': real_estate_1.SYSTEM_INSTRUCTION,
    'kartik': cart_recovery_1.SYSTEM_INSTRUCTION,
    'sonali': edtech_1.SYSTEM_INSTRUCTION,
    'real-estate': real_estate_1.SYSTEM_INSTRUCTION,
    'cart-recovery': cart_recovery_1.SYSTEM_INSTRUCTION,
    'edtech': edtech_1.SYSTEM_INSTRUCTION,
};
const getPrompt = (agentId) => {
    return exports.PROMPTS[agentId.toLowerCase()];
};
exports.getPrompt = getPrompt;
