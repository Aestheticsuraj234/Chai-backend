
import express from 'express';
import cors from 'cors';
import cookie_Parser from 'cookie-parser';

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true

}));

app.use(express.json({
    limit: '16mb'
}));    // *to support JSON-encoded bodies

app.use(express.urlencoded({
    extended: true,
    limit: '16mb'
})); // *to support URL-encoded bodies

app.use(express.static('public'));
app.use(cookie_Parser());


// Routes import
import userRouter from './routes/user.routes.js';


// routes declaration

app.use('/api/v1/user', userRouter);










export { app}
