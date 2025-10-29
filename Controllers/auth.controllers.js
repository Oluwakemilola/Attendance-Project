import mongoose from "mongoose";
import Auth from '../models/auth.model.js';
import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import bcrypt from 'bcrypt';



// Creating a mongoose session
export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

         const {name, email, password, track} = req.body;
    

// check if any of the data to be missing
if (!name || !email || !password || !track) {
    return res.status(400).json({message: "All fields are required"})     
}

    const existingUser  = await Auth.findOne({email}).session(session);
    if (existingUser) {
        return res.status(400).json({message: "User already exists"})
    }
// TO Password and harshing
    const salt = await bcrypt.genSalt(10) // random
    const hashpassword = await bcrypt.hash(password, salt);
    

// to create user

const newUser = await Auth.create([{name, email, password:hashpassword, track }], {session} )

// Generate Token

const token = jwt.sign(
  { userId: newUser[0]._id, email: newUser[0].email },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRES_IN }
);


// commit the transaction to mongoose

await session.commitTransaction();
session.endSession();

return res.status(200).json({
    message:"User Created Succefully",
    user: {
        id: newUser[0]._id,
        name: newUser[0].name,
        email: newUser[0].email,
        password: newUser[0].password,
        track: newUser[0].track,
        token: token
    }
})

} catch (error) {
    await session.abortTransaction();
     session.endSession();
    return res.status(500).json({message: "something went wrong",error: error.message})
}

}


export const signIn = async (req, res, next) =>{
    res.send('Welcome Back')

}



