import mongoose from "mongoose";
import Enroll from "../models/enroll.model.js";
//MARK ATTENDANCE CONTROLLER
// helper Function
const isWeekend = (date) => {
    const day = date.getDay()
    return day === 0 || day === 6
    //day 0 is sunday and day 6 is saturday
}

const getStartOfDay = (date) => {
    const start = new Date(date)
    start.setHours(9,0,0,0)
    return start;
}

const getEndOfDay = (date) =>{
    const end = new Date(date)
    end.setHours(14, 59, 99, 999)
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

//1. To mark attendance
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

          if(today < startDate){
          return res.status(400).json({message: "The day hasnt started yet"})
        }

         if(today > endDate){
          return res.status(400).json({message: "The day has ended"})
        }

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
    try {
       const today = new Date(); // Helps to get todays date and time
       //dont run if it is weekend
       if(isWeekend(today)) {
        const message = "weekend - No auto-marking needed";
        console.log(message)
       
        if(res){
            return res.status(200).json({message})
        }
        return;
      }
        //check if the current time is between (9am and 1:59pm)
        const dayBegins = getStartOfDay(today)
        const dayEnds = getEndOfDay(today)

        // This will return all the list of the students in the database

        const students = await Enroll.find({})
         //Looping through the list of student to check how many students are present or absent
        let MarkedCount = 0;
        for(const student of students){
            const markToday = student.attendance.some((record) =>{
                const recordDate = new Date(record.date)
                // Check if the date is within today 
                return (record.status === "present" &&
                  recordDate >= dayBegins && recordDate <= dayEnds
                )
            })

            // if attendance is not marked todat, mark them absent
            if(!markToday) {
              student.attendance.push({
                date:today,
                status: "absent"
              });
              

              await student.save();
              MarkedCount ++
              console.log(`Auto marked ${student.email} as absent for today ${today.toDateString()}`)
            }
        };
        const message = `The total number of student auto marked as absent today is ${MarkedCount}`;
        console.log(message)
    } catch (error) {
      console.log("Error in auto marking absence:", error.message);
      
    }
}


 export const getAttendanceByDateRange = async (req, res, next) => {
        // This line gets the query strings
        try {
            const {start, end} = req.query

        // this block checks if start and end exist
        if (!start || !end){
            return res.status(400).json({
                message: "Start date and end date are required!"})
        }
        const startDate = new Date(start)
        const endDate = new Date(end)
        endDate.setHours(23, 59, 59, 999)

        if (isNaN(startDate) || isNaN(endDate)){
            return res.status(400).json({
                message: "Not a valid date, try YYYY-MM-DD"})
        }
        const students = await Enroll.find({}, {
            firstname: 1,
            lastname: 1,
            email: 1,
            track: 1,
            attendance: 1,})

        //filtering
       const findStudents = students.map(student => {
        const filteredStudents = student.attendance.filter(record => {
            const recordDate = new Date(record.date)
            return recordDate >= startDate && recordDate <= endDate})

            if(filteredStudents.length > 0) {
                return {
                    name: `${student.firstname} ${student.lastname}`,
                    email: student.email,
                    learningtrack: student.learningtrack,
                    gender: student.gender
                }
            }
            return null
       }).filter(Boolean)
       res.status(200).json({message: "successful",
        data: findStudents
       })
        } catch (error) {
            
            res.status(500).json({
        message: "something went wrong", error:error.message
       })
        }

       
       
    }
   
    



export const getOverallAllAttendance = async (req, res, next) => {

}

export const studentWithAttendance = async (req, res, next) => {

}

export const filterByTrack = async (req, res, next) => {
    try {
        const {learningtrack} = req.query
        if(!learningtrack)
            return res.status(400).json({message:"Learning track not found"})
        const trainee = await Enroll.find({learningtrack}, {
            firstname: 1,
            lastname: 1,
            email: 1,
            learningtrack: 1,
            attendance: 1
        })
        // to filter
        const findtrainees = trainee.map(trainee => {
            const filteredtrainees = trainee.attendance.filter(record => record.track === learningtrack)
         
        if(filteredtrainees.length > 0) {
            return {
                name: `${trainee.firstname} ${trainee.lastname}`,
                email: trainee.email,
                learningtrack: trainee.learningtrack,
                gender: trainee.gender
            }
        }          
            
        return null
        }).filter(Boolean)
        res.status(200).json({message: "successful",
            data: trainee
        })
    } catch (error) {
        res.status(500).json({message:"something went wrong",
            error: error.message
        })
    }
}