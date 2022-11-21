"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = __importDefault(require("../utils/appError"));
const devError = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
    else {
        res.status(err.statusCode).json({
            title: 'Algo deu errado!',
            message: err.message
        });
    }
};
const prodError = (err, req, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    else {
        console.error('ERRO', err);
        res.status(500).json({
            status: 'error',
            message: 'something went wrong!'
        });
    }
};
const handleJWTError = (err) => new appError_1.default('Token inválido. Por favor, faça o login novamente.', 401);
const handleJWTExpired = (err) => new appError_1.default('Seu token expirou. Por favor, faça o login novamente.', 401);
const handleExistingUser = (err) => new appError_1.default('Já existe um usuário com este nome. Por favor, tente novamente.', 401);
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        devError(err, req, res);
    }
    else if (process.env.NODE_ENV === 'production') {
        let newErr = Object.assign({}, err);
        newErr.message = err.message;
        if (err.name === 'JsonWebTokenError')
            newErr = handleJWTError(newErr);
        if (err.name === 'TokenExpiredError')
            newErr = handleJWTExpired(newErr);
        if (err.constraint === 'users_username_key')
            newErr = handleExistingUser(newErr);
        prodError(newErr, req, res);
    }
};
exports.default = errorHandler;
