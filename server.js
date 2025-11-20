import express from 'express';
import {dataBase} from "./database/mongodb.js";
import { PORT } from './config/env.js';
import authRouter from './routes/auth.route.js';
import cookieparser from 'cookie-parser';
import cors from 'cors'
import enrollRouter from './routes/enroll.route.js';
import attendanceRouter from './routes/attendance.route.js';
import { autoMarkAbsence } from './Controllers/attendance.controllers.js';
import cron from 'node-cron';
// Schedule the autoMarkabsence function to run every day at 2:00 PM

const app = express();
// middlewares
app.use(cookieparser());
app.use (express.json());
app.use(cors({
    origin: "http://localhost:8000",
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Contenty-Type", "Authorization"]
})),
app.use (express.urlencoded({extended: true}));

cron.schedule(' 59 14 * * *', async () => {
    console.log("Testing cron job for auto marking absence")
    await autoMarkAbsence(null, null);
});



// Router
app.use('/api/v1/auth', authRouter)

app.use('/api/v1/en', enrollRouter)
app.use('/api/v1/atd', attendanceRouter)





app.listen(PORT, () => {
    dataBase()
    console.log(`server is running `)
    
})

