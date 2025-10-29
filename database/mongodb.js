import mongoose from "mongoose";
import {  MONGODB_URL } from "../config/env.js";

export const dataBase = async () => {
    try {
        await mongoose.connect(`${ MONGODB_URL}`)
        console.log('database is connected Successfully');
        
    } catch (error) {
        console.log("Database not connected", error);
        
    }
}