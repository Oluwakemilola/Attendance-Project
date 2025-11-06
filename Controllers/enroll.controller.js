import mongoose from "mongoose";
import Enroll from '../models/enroll.model.js'

export const enroll = async(req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {firstname, lastname, email, phonenumber, gender, learningtrack} = req.body;

        // To check if any of the data is missing
        if(!firstname || !lastname || !email  || !phonenumber ||!gender || ! learningtrack ) {
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
// helper Function
const isWeekend = (date) => {
    const day = date.getDay()
    return day === 0 || day === 6
    //day 0 is sunday and day 6 is saturday
}

const getStartOfDay = (date) => {
    const start = new Date(date)
    start.setHours(0,0,0,0)
    return start;
}

const getEndOfDay = (date) =>{
    const end = new Date(date)
    end.setHours(23, 59, 99, 999)
    return end
}
//Helper function to get working days from (mon-fri)
const getWorkingDays = (startDate, endDate) => {
    const workingDays = [ ];
    const current = new Date(startDate)

    while (current <= endDate) {
        if(!isWeekend(current)) {
            workingDays.push(new Date(current))
        }
        current.setDate(current.getDate() + 1); // move to next day
    }
    return workingDays;
};

export const markAttendance = async (req, res, next) => {
    try {
        const{email} = req.body;
        // Check for empty input
        if(!email) {
            return res.status(400).json({
                message:"Email is required"
            })
        }

        // Validate if Student Exist
        const student = await Enroll.findOne({email})
        if (!student) {
            return res.status(400).json({
                message:"Student dosent exist"
            })
        }

        const today = new Date()
        console.log("Today's date is:", today);

        //Check if today is weekend

        if (isWeekend (today)) {
            res.status(400).json({message: "Attendance cannot be marked today"})
            
        }
        // To prevent Student from marking twice
        const endDate = getEndOfDay(today)
        const startDate = getStartOfDay(today)
        //  This means startOfDay is 0.00 midnight
        // this means endOfDay is 11.59pm today,
       // so we are creating a time range that represent today Only

       const alreadyMarked = student.attendance.some((records) => {
        const recordDate = new Date (records.date)
        return recordDate >= startDate && recordDate <= endDate
       })

       if(alreadyMarked){
        return res.status(400).json({
            message:"Attendance Already Marked"
        })
       }

       // To mark the student present

       student.attendance.push({
        date: today,
        status: "present"
       })

       // To save it
       await student.save()
       return res.status(200).json({
        message: "Attendance marked successfully"
       })

    } catch (error) {
        res.status(500).json({message: "something went wrong",
            error:error.message
        })
    }

}

export const autoMarkAbsence = async (req, res, next) => {

}

export const getOverallAllAttendance = async (req, res, next) => {

}

export const studentWithAttendance = async (req, res, next) => {

}