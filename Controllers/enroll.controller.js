import mongoose from "mongoose";
import Enroll from '../models/enroll.model.js'

export const enroll = async(req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {firstname, lastname, email, phonenumber, gender, learningtrack} = req.body;

        // To check if any of the data is missing
        if(!firstname || !lastname || !email  || !phonenumber || !gender || !learningtrack ) {
            return res.status(400).json({
                message:"All fields are required"
            })
        } 
        const existingStudent = await Enroll.findOne({email}).session(session)
        if(existingStudent) {
            return res.status(400).json({
                message:"User already exist"
            })
        }

        const newStudent = await Enroll.create([{firstname, lastname, email, phonenumber, gender, learningtrack}], {session})
        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            message:"Student enrolled successfully"})

    
} catch(error) {
    await session.abortTransaction()
    session.endSession()
   next(error)

}
}

// TO get all the enroll students
export const allstudents = async (req, res, next) => {
   try {
     const enrolls = await Enroll.find();
     res.status(200).json({message: "successful",
        data: enrolls
     })

     }
    catch (error) {
    res.status(500).json({message: "server error", error})
   }
}
