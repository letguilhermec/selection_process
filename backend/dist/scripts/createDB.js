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
        yield db_1.default.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        yield db_1.default.query('CREATE TABLE IF NOT EXISTS accounts (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), balance MONEY NOT NULL);');
        yield db_1.default.query('CREATE TABLE IF NOT EXISTS users (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, accountId uuid REFERENCES accounts(id));');
        yield db_1.default.query('CREATE TABLE IF NOT EXISTS transactions(id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), debitedAccountId uuid REFERENCES accounts(id) NOT NULL, creditedAccountId uuid REFERENCES accounts(id) NOT NULL, value MONEY NOT NULL, createdAt TIMESTAMP DEFAULT current_timestamp);');
        yield db_1.default.query("CREATE OR REPLACE FUNCTION disallow_overflow() RETURNS trigger AS $$ BEGIN if(NEW.balance::numeric < 0) then raise exception 'Invalid update.' using hint = 'Tentativa de transferência em valor maior que o saldo atual.'; end if; RETURN NEW; END $$ LANGUAGE plpgsql;");
        yield db_1.default.query('CREATE OR REPLACE TRIGGER tr_disallow_overflow BEFORE UPDATE OF balance ON accounts FOR EACH ROW EXECUTE PROCEDURE disallow_overflow();');
        process.exit(0);
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }
});
createDB();
