"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_1 = require("cookie");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const balanceRoutes_1 = __importDefault(require("./routes/balanceRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const errorController_1 = __importDefault(require("./controllers/errorController"));
const appError_1 = __importDefault(require("./utils/appError"));
const express_session_1 = __importDefault(require("express-session"));
const corsOptions = {
    origin: ['http://127.0.0.1:3000', 'http://127.0.0.1:3000/account', 'http://127.0.0.1:3000/account/signup', 'http://127.0.0.1:3000/account/signin'],
    credentials: true
};
const app = (0, express_1.default)();
app.enable('trust proxy');
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
app.use((0, express_session_1.default)({
    secret: 'tesa09825eafhgjksdlk',
    name: 'sid',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        domain: 'http://127.0.0.1'
    },
}));
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.get('/', (req, res) => {
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false
    };
    res.setHeader('Set-Cookie', (0, cookie_1.serialize)('jwt', 'thirdtest', cookieOptions));
    res.json('req');
});
app.get('/get', (req, res) => {
    console.log(req.cookies);
    res.status(200);
});
app.use('/api/v1/users', userRoutes_1.default);
app.use('/api/v1/balance', balanceRoutes_1.default);
app.use('/api/v1/transactions', transactionRoutes_1.default);
app.use(errorController_1.default);
app.all('*', (req, res, next) => {
    next(new appError_1.default(`Este servidor não tem um endpoint ${req.originalUrl}`, 405));
});
exports.default = app;
