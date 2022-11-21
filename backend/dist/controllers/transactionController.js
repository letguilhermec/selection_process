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
exports.performTransaction = exports.checkAccAndBalance = exports.viewTransactions = exports.checkQuery = void 0;
const db_1 = __importDefault(require("../db"));
const appError_1 = __importDefault(require("../utils/appError"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const verifyInput_1 = require("../utils/verifyInput");
const checkQuery = (req, _res, next) => {
    let { start, end, cashout, cashin } = req.query;
    let dateRegex = new RegExp('^[0-9]{4}-[0-9]{2}-[0-9]{2}$');
    if (!start) {
        start = undefined;
    }
    if (start !== undefined && !dateRegex.test(start)) {
        return next(new appError_1.default('Parâmetro inválido -> start. Por favor, informe a data seguindo o seguinte padrão: AAAA-MM-DD.', 401));
    }
    if (!end) {
        end = 'NOW()';
    }
    if (end !== 'NOW()' && !dateRegex.test(end)) {
        return next(new appError_1.default('Parâmetro inválido -> end. Por favor, informe a data seguindo o seguinte padrão: AAAA-MM-DD.', 401));
    }
    if (!cashout) {
        cashout = undefined;
    }
    if (!cashin) {
        cashin = undefined;
    }
    req.start = start;
    req.end = end;
    req.cashout = cashout;
    req.cashin = cashin;
    return next();
};
exports.checkQuery = checkQuery;
exports.viewTransactions = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let cashInOutConfig = 't.creditedaccountid = $1 OR t.debitedaccountid = $1';
    let dateConfig = '';
    let values = [];
    if (req.start || req.cashout || req.cashin || req.end !== 'NOW()') {
        if ((req.cashin && req.cashout) || (!req.cashin && !req.cashout)) {
            cashInOutConfig = 't.creditedaccountid = $1 OR t.debitedaccountid = $1';
        }
        else if (req.cashin) {
            cashInOutConfig = 't.creditedaccountid = $1';
        }
        else {
            cashInOutConfig = 't.debitedaccountid = $1';
        }
        if (req.start) {
            dateConfig = 'AND createdat BETWEEN $2 AND $3';
            if (req.end == 'NOW()') {
                values = [req.user.accountid, req.start, req.end];
            }
            else {
                values = [req.user.accountid, req.start, `${req.end} 23:59:59`];
            }
        }
        else if (!req.start && req.end !== 'NOW()') {
            dateConfig = 'AND createdat < $2';
            values = [req.user.accountid, `${req.end} 23:59:59`];
        }
        else {
            values = [req.user.accountid];
        }
        let masterQuery = `SELECT d as remetente, c as destinatário, value as valor, createdat as horário FROM transactions as t, LATERAL (SELECT username FROM users as u WHERE t.debitedaccountid = u.accountid) as d, LATERAL (SELECT username FROM users as u WHERE t.creditedaccountid = u.accountid) as c WHERE (${cashInOutConfig}) ${dateConfig}`;
        let transactions = yield db_1.default.query(masterQuery, values);
        if (!transactions || transactions.rowCount == 0) {
            return res.status(200).json({
                status: 'Sucesso',
                data: {
                    transactions: []
                }
            });
        }
        return res.status(200).json({
            status: 'Sucesso',
            data: {
                transactions: transactions.rows
            }
        });
    }
    else {
        const transactions = yield db_1.default.query('SELECT d as remetente, c as destinatário, value as valor, createdat as horário FROM transactions as t, LATERAL (SELECT username FROM users as u WHERE t.debitedaccountid = u.accountid) as d, LATERAL (SELECT username FROM users as u WHERE t.creditedaccountid = u.accountid) as c WHERE t.creditedaccountid = $1 OR t.debitedaccountid = $1;', [req.user.accountid]);
        if (!(transactions.rows.length > 0)) {
            return res.status(200).json({
                status: 'Sucesso',
                data: {
                    transactions: []
                }
            });
        }
        return res.status(200).json({
            status: 'Sucesso',
            data: {
                transactions: transactions.rows,
            }
        });
    }
}));
const checkIfEnoughBalance = (accid, desired) => __awaiter(void 0, void 0, void 0, function* () {
    const balance = yield db_1.default.query('SELECT balance::numeric FROM accounts WHERE id = $1', [accid]);
    return (Number(balance.rows[0].balance) * 100 > Number(desired * 100));
});
exports.checkAccAndBalance = (0, catchAsync_1.default)((req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { cashInUser, amount } = req.body;
    // Every username is UNIQUE. Checking them against each other should be enought to discard attempted transactions to self.
    if (req.user.username === cashInUser.toUpperCase()) {
        return next(new appError_1.default('Não é possível realizar uma transferência para a própria conta.', 401));
    }
    if (isNaN(amount) || (0, verifyInput_1.checkDecimals)(amount) > 2) {
        return next(new appError_1.default('O valor informado é inválido. O valor deve conter, no máximo, duas casas decimais e o valor inteiro deve ser separado dos centavos por um ponto. Por favor, tente novamente', 401));
    }
    if (!(yield checkIfEnoughBalance(req.user.accountid, amount))) {
        return next(new appError_1.default('Não há saldo o sufiente para esta transação.', 401));
    }
    let cashInUserAccId = yield db_1.default.query('SELECT accountid FROM users WHERE username = $1', [cashInUser.toUpperCase()]);
    if (!cashInUserAccId) {
        return next(new appError_1.default('Destinatário inválido. Não encontramos o usuário em nosso banco de dados.', 401));
    }
    req.cashInUserId = cashInUserAccId.rows[0].accountid;
    req.amount = amount;
    next();
}));
exports.performTransaction = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    ;
    (() => __awaiter(void 0, void 0, void 0, function* () {
        const client = yield db_1.default.connect();
        try {
            yield client.query('BEGIN');
            const reSub = yield client.query('UPDATE accounts SET balance = balance::numeric - $1 WHERE id = $2', [req.amount, req.user.accountid]);
            const resAdd = yield client.query('UPDATE accounts SET balance = balance::numeric + $1 WHERE id = $2', [req.amount, req.cashInUserId]);
            const resAddTransactions = yield client.query('INSERT INTO transactions (debitedaccountid, creditedaccountid, value) VALUES ($1, $2, $3)', [req.user.accountid, req.cashInUserId, req.amount]);
            yield client.query('COMMIT');
        }
        catch (err) {
            yield client.query('ROLLBACK');
        }
        finally {
            client.release();
        }
    }))().catch(_err => next(new appError_1.default('Não foi possível realizar a transferência. Por favor, tente novamente.', 500)));
    res.status(201).json({
        status: 'success',
    });
}));
