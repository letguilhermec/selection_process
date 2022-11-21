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
const db_1 = __importDefault(require("../db"));
class UserModel {
    constructor() {
        this.table = 'users';
        this.pool = db_1.default;
    }
    getUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.pool.query(`SELECT * FROM users WHERE username = ${username}`);
        });
    }
    createUser(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.pool.query(`INSERT INTO $1(username, password) VALUES($2, $3) RETURNING *`, [this.table, username, password]);
        });
    }
    seedTable() {
        return __awaiter(this, void 0, void 0, function* () {
            let accountId = yield this.pool.query("INSERT INTO accounts (balance) VALUES (100.00) RETURNING id");
            return this.pool.query('INSERT INTO users (username, password, accountId) VALUES ($1, $2, $3)', ['test', 'test1234', accountId]);
        });
    }
}
exports.default = UserModel;
