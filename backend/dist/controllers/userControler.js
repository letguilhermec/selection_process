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
exports.verify = exports.protect = exports.logout = exports.login = exports.createAccount = exports.createUser = exports.verifyUsernameAndPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_promisify_1 = __importDefault(require("jwt-promisify"));
const db_1 = __importDefault(require("../db"));
const appError_1 = __importDefault(require("../utils/appError"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const verifyInput_1 = require("../utils/verifyInput");
const signToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};
const createAndSendToken = (user, statusCode, _req, res) => {
    const token = signToken(user.id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false
    };
    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        },
    });
};
const verifyUsernameAndPassword = (req, _res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return next(new appError_1.default('Nome de usuário e senha são obrigatórios.', 400));
    }
    if (username.length < 3) {
        return next(new appError_1.default('O username deve conter, pelo menos, 3 caracteres.', 400));
    }
    if (!(0, verifyInput_1.checkPassword)(password)) {
        return next(new appError_1.default('A senha deve conter mais de oito caracteres e, pelo menos, um número e uma letra maiúscula.', 400));
    }
    req.username = username.toUpperCase();
    req.pass = password;
    return next();
};
exports.verifyUsernameAndPassword = verifyUsernameAndPassword;
exports.createUser = (0, catchAsync_1.default)((req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let newPass = yield bcrypt_1.default.hash(req.pass, 12);
    let newUser = yield db_1.default.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id', [req.username, newPass]);
    if (!newUser) {
        return next(new appError_1.default('Erro. Por favor, tente novamente', 500));
    }
    req.user = newUser.rows[0].id;
    return next();
}));
exports.createAccount = (0, catchAsync_1.default)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    let newAccount = yield db_1.default.query('INSERT INTO accounts (balance) VALUES (100.00) RETURNING id, balance');
    let updatedUser = yield db_1.default.query('UPDATE users SET accountid = $1 WHERE id = $2 RETURNING id, username', [newAccount.rows[0].id, req.user]);
    let newUser = {
        id: updatedUser.rows[0].id,
        username: updatedUser.rows[0].username,
        accountid: newAccount.rows[0].id,
        balance: newAccount.rows[0].balance
    };
    createAndSendToken(newUser, 201, req, res);
}));
exports.login = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        return next(new appError_1.default('Por favor, insira o nome do usuário e a senha.', 401));
    }
    const user = yield db_1.default.query('SELECT * FROM users WHERE username = $1', [username.toUpperCase()]);
    if (!(user.rows.length > 0) || !(yield (0, verifyInput_1.compare)(password, user.rows[0].password))) {
        return next(new appError_1.default('Usuário ou senha inválidos.', 401));
    }
    createAndSendToken(user.rows[0], 200, req, res);
}));
const logout = (_req, res) => {
    res.cookie('jwt', 'logged out', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
};
exports.logout = logout;
exports.protect = (0, catchAsync_1.default)((req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(new appError_1.default('Você não está logado. Por favor, faça o login novamente.', 401));
    }
    const payload = yield jwt_promisify_1.default.verify(token, process.env.JWT_SECRET);
    const user = yield db_1.default.query('SELECT username, accountid FROM users WHERE id = $1', [payload.id]);
    if (!(user.rows.length > 0)) {
        return next(new appError_1.default('O usuário não está mais cadastrado.', 401));
    }
    req.user = user.rows[0];
    next();
}));
exports.verify = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.cookies.jwt) {
        const payload = yield jwt_promisify_1.default.verify(req.cookies.jwt, process.env.JWT_SECRET);
        const user = yield db_1.default.query('SELECT id, username, accountid FROM users WHERE id = $1', [payload.id]);
        if (!(user.rows.length > 0)) {
            return res.status(204).json({
                status: 'fail',
                message: 'Usuário não está logado.'
            });
        }
        const { id, username, accountid } = user.rows[0];
        return res.status(200).json({
            id,
            username,
            accid: accountid
        });
    }
    else {
        return res.status(204).json({
            status: 'fail',
            message: 'Usuário não está logado.'
        });
    }
}));
