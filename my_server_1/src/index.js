import { app } from './app.js';
import connectDB from './db/db.js';
import dotenv from 'dotenv';

dotenv.config({path:"./.env"});

connectDB().then(() => {
    app.on('error', (error) => {
        console.log(error.message);
    })
    app.listen(process.env.PORT || 8080, () => {
        console.log('Server is running on port' , process.env.PORT);
    });
}).catch((error) => console.log(error.message));