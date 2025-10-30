import express from 'express';
import {dataBase} from "./database/mongodb.js";
import { PORT } from './config/env.js';
import authRouter from './routes/auth.route.js';
import cookieparser from 'cookie-parser';
import cors from 'cors'
import enrollRouter from './routes/enroll.route.js';





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


// Router
app.use('/api/v1/auth', authRouter)

app.use('/api/v1/en', enrollRouter)

app.use('api/vi/st', enrollRouter)


app.listen(PORT, () => {
    dataBase()
    console.log(`server is running `)
    
})


