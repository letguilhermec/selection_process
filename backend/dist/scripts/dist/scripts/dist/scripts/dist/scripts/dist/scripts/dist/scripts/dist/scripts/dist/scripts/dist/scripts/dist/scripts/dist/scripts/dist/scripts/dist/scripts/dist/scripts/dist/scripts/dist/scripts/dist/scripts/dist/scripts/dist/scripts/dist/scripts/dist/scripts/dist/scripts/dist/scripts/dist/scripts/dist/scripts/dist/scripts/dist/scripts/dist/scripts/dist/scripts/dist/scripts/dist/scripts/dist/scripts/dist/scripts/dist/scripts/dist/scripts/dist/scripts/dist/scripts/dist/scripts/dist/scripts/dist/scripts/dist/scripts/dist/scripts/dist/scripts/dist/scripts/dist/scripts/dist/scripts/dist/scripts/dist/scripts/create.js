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
const createDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.default.query('CREATE EXTENSION "uuid-ossp";');
        yield db_1.default.query('DROP TABLE IF EXISTS accounts; CREATE TABLE accounts (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), balance MONEY NOT NULL);');
        yield db_1.default.query('DROP TABLE IF EXISTS users; CREATE TABLE users (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, accountId uuid REFERENCES accounts(id) NOT NULL);');
        yield db_1.default.query('DROP TABLE IF EXISTS transactions; CREATE TABLE transactions(id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), debitedAccountId uuid REFERENCES accounts(id) NOT NULL, creditedAccountId uuid REFERENCES accounts(id) NOT NULL, value MONEY NOT NULL, createdAt TIMESTAMP DEFAULT current_timestamp)');
        process.exit(0);
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }
});
createDB();
