"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDecimals = exports.compare = exports.checkPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
let upperRegex = /[A-Z]/g;
let numRegex = /[0-9]/g;
const checkPassword = (pass) => {
    if (pass.length >= 8 && pass.match(upperRegex) && pass.match(numRegex)) {
        return true;
    }
    return false;
};
exports.checkPassword = checkPassword;
const compare = (candidate, correct) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.compare(candidate, correct);
});
exports.compare = compare;
const checkDecimals = (value) => {
    if (typeof value !== 'string') {
        value = value.toString();
    }
    if (value.indexOf('e-') > -1) {
        let [base, trail] = value.split('e-');
        let deg = parseInt(trail, 10);
        return deg;
    }
    if (Math.floor(Number(value)) !== Number(value)) {
        return value.split('.')[1].length || 0;
    }
    return 0;
};
exports.checkDecimals = checkDecimals;
