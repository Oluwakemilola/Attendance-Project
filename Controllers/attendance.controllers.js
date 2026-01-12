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
// Marks a student as present for today.
// Validates email, checks student existence, prevents weekend marking,
// ensures attendance is marked only once per day, and saves the record.

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
// 2. AutoMarkAbsence
// Automatically marks all students as absent for today
// if they did not mark attendance within the allowed time window.
// Skips weekends and prevents duplicate daily records.

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


//3. getOverallAttendance
// Fetches all students, checks today’s attendance, computes individual
//  and overall attendance statistics, and returns a detailed attendance report.
export const getOverallAttendance = async (req, res, next) => {
    try {
        // Fetch all students from the database
        const students = await Enroll.find({});
        const totalStudents = students.length;

        if (totalStudents === 0) {
            return res.status(404).json({ message: "No students found" });
        }

        const today = new Date();
        const startOfDay = getStartOfDay(today);
        const endOfDay = getEndOfDay(today);

        let totalPresentToday = 0;
        let totalAbsentToday = 0;

        const summarises = [];

        // Loop through each student to calculate today's attendance and overall percentage
        students.forEach(student => {
            const isPresentToday = student.attendance.some(record => {
                const recordDate = new Date(record.date);
                return recordDate >= startOfDay && recordDate <= endOfDay && record.status === "present";
            });

            const isAbsentToday = student.attendance.some(record => {
                const recordDate = new Date(record.date);
                return recordDate >= startOfDay && recordDate <= endOfDay && record.status === "absent";
            });

            if (isPresentToday) totalPresentToday++;
            if (isAbsentToday) totalAbsentToday++;

            // Student's overall attendance percentage from schema method
            const attendancePercentage = Number(student.getAttendancePercentage());

            summarises.push({
                studentId: student._id,
                name: `${student.firstname} ${student.lastname}`,
                email: student.email,
                gender: student.gender,
                learningTrack: student.Track,
                presentToday: isPresentToday ? 1 : 0,
                absentToday: isAbsentToday ? 1 : 0,
                attendancePercentage
            });
        });

        // Find student with highest and lowest attendance
       const best = summarises.reduce(
    (max, s) => s.attendancePercentage > max.attendancePercentage ? s : max,
    summarises[0]
);

const worst = summarises.reduce(
    (min, s) => s.attendancePercentage < min.attendancePercentage ? s : min,
    summarises[0]
);


        // Average attendance
        const averageAttendance = summarises.reduce((sum, s) => sum + s.attendancePercentage, 0) / totalStudents;

        // Overall attendance percentage for all students
        const overallAttendancePercentage = summarises.reduce((sum, s) => sum + s.attendancePercentage, 0) / totalStudents;

        return res.status(200).json({
    totalStudents,
    totalPresentToday,
    totalAbsentToday,
    overallAttendancePercentage: Number(overallAttendancePercentage.toFixed(2)),
    averageAttendance: Number(averageAttendance.toFixed(2)),
    bestAttendance: Number(best.attendancePercentage.toFixed(2)),
    worstAttendance: Number(worst.attendancePercentage.toFixed(2)),
    summarises
});


    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong!",
            error: error.message
        });
    }
};

// 4. getAttendanceByDateRange
// Fetches students who have attendance records within a given date range.
// Filters attendance history between start and end dates
// and returns matching students with basic profile details.

 export const getAttendanceByDateRange = async (req, res) => {
    try {
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({
                message: "Start date and end date are required!"
            });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);

        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).json({
                message: "Not a valid date, use YYYY-MM-DD"
            });
        }

        const students = await Enroll.find({}, {
            firstname: 1,
            lastname: 1,
            email: 1,
            learningtrack: 1,
            gender: 1,
            attendance: 1
        });

        const filteredStudents = students
            .map(student => {
                const attendanceInRange = student.attendance.filter(record => {
                    const recordDate = new Date(record.date);
                    return recordDate >= startDate && recordDate <= endDate;
                });

                if (!attendanceInRange.length) return null;

                return {
                    name: `${student.firstname} ${student.lastname}`,
                    email: student.email,
                    learningtrack: student.learningtrack,
                    gender: student.gender,
                    totalRecords: attendanceInRange.length
                };
            })
            .filter(Boolean);

        return res.status(200).json({
            message: "successful",
            count: filteredStudents.length,
            data: filteredStudents
        });

    } catch (error) {
        return res.status(500).json({
            message: "something went wrong",
            error: error.message
        });
    }
};

   
// 5. getAllStudentWithAttendance
// Retrieves all students with their attendance summaries.
// Returns total present days, absent days, and attendance percentage
// for each student.

// Controller to get all students with their attendance details
export const getAllStudentWithAttendance = async (req, res, next) => {

    // Log to the server console to show the function was executed
    console.log("fetching all students");

    try {
        // Fetch all students from the database
        const students = await Enroll.find({});

        // Process each student to calculate their attendance details
        const results = students.map((student) => {

            // Count how many days the student was marked "present"
            const presentDays = student.attendance.filter(
                record => record.status === "present"
            ).length;

            // Count how many days the student was marked "absent"
            const absentDays = student.attendance.filter(
                record => record.status === "absent"
            ).length;

            // Total attendance records for this student
            const totalDays = presentDays + absentDays;

            // Return a simplified object containing important info
            return {
                studentId: student._id,                              // MongoDB ID
                name: `${student.firstname} ${student.lastname}`,    // Full name
                email: student.email,                                // Email
                presentDays,                                         // Number of present days
                absentDays,                                          // Number of absent days
                percentage: student.getAttendancePercentage()        // Attendance percentage (from model method)
            };
        });

        // Send the processed results back to the client
        return res.status(200).json({ students: results });

    } catch (error) {
        // Handle unexpected errors
        return res.status(500).json({
            message: "Something went wrong!",
            error: error.message
        });
    }
};


//6. getStudentWithAttendance
// Retrieves full attendance details for a single student by ID.
// Returns present count, absent count, attendance percentage,
// and complete attendance history.

export const getStudentAttendance = async (req, res, next) => {

    try {
        const { id } = req.params;  
        // Get the student's ID from the URL parameters

        // Find the student in the database using their ID
        const student = await Enroll.findOne({ _id: id }); 

        // If no student was found, send a "Not Found" response
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }   

        // Count how many times the student was marked "present"
        const totalPresent = student.attendance.filter(
            record => record.status === "present"
        ).length;   

        // Count how many times the student was marked "absent"
        const totalAbsent = student.attendance.filter(
            record => record.status === "absent"
        ).length;

        // Add present and absent days to get total attendance days
        const totalDays = totalPresent + totalAbsent;

        // Calculate attendance percentage
        // If the student has no attendance records, return 0
        const percentage = totalDays === 0 
            ? 0 
            : ((totalPresent / totalDays) * 100);

        // Send the final response back to the client
        return res.status(200).json({
            name: `${student.firstname} ${student.lastname}`, // Student's full name
            presentDays: totalPresent,                        // Number of present days
            absentDays: totalAbsent,                          // Number of absent days
            percentage,                                        // Attendance percentage
            attendanceHistory: student.attendance,             // Full attendance records
        });
    
    } catch (error) {
        // Handle unexpected server errors
        return res.status(500).json({ message: "Something went wrong!", error: error.message });
    }      
}


// export const filterByTrack = async (req, res, next) => {
//     try {
//         const {learningtrack} = req.query

//         if(!learningtrack){
//             return res.status(400).json({message:"provide a Learning track"})
//         }

//         const trainee = await Enroll.find({learningtrack}, {
//             firstname: 1,
//             lastname: 1,
//             email: 1,
//             learningtrack: 1,
//             attendance: 1
//         })

//         if(trainee.length === 0){
//              return res.status(404).json({message:"Learning track not found"})
//         }

//         const findtrainees = trainee.map(t=> ({
//                 name: `${t.firstname} ${t.lastname}`,
//                 email: t.email,
//                 learningtrack: t.learningtrack,
//                 gender: t.gender
//         }))
        
//         res.status(200).json({message: "successful",
//             data: findtrainees
//         })
//     } catch (error) {
//         res.status(500).json({message:"something went wrong",
//             error: error.message
//         })
//     }
// }

// 7. Controller to get attendance by learning track
// Retrieves attendance data for all students in a specific learning track.
// Returns present days, absent days, and attendance percentage per student.

export const getAttendanceByTrack = async (req, res, next) => {
    try {
        // Replace hyphens with spaces → "backend-development" becomes "backend development"
        const track = req.params.track.replace(/-/g, " ");

        // Find students in this specific learning track, case-insensitive match
        const students = await Enroll.find({
            learningtrack: new RegExp(`^${track}$`, "i")
        });

        // If no students found, return an error response
        if (students.length === 0) {
            return res.status(404).json({ message: "No students found for this track" });
        }
        
        // Prepare the result for each student in the track
        const result = students.map((student) => {

            // Count how many times the student was marked present
            const presentDays = student.attendance.filter(
                (attendance) => attendance.status === "present"
            ).length;

            // Count how many times the student was marked absent
            const absentDays = student.attendance.filter(
                (attendance) => attendance.status === "absence"
            ).length;

            // Total number of days recorded for this student
            const totalDays = presentDays + absentDays;

            // Return structured attendance data for this student
            return {
                name: `${student.firstname} ${student.lastname}`,   // Full name
                email: student.email,                               // Email address
                track: student.track,                                // 
                presentDays,                                        // Total present count
                absentDays,                                         // Total absent count
                percentage: student.getAttendancePercentage()       // Attendance %
            };
        });

        // Send the final response with all students' attendance in this track
        return res.status(200).json({
            message: `Attendance for track: ${track} fetched successfully`,
            count: result.length,
            data: result
        });

    } catch (error) {
        // Catch any server-side error and return 500 response
        res.status(500).json({ message: "Something went wrong!", error: error.message });
    }
};

// 8.getAttendanceByName
// Searches for students by first or last name (case-insensitive).
// Returns attendance counts and full attendance records
// for all matching students.

export const getAttendanceByName = async (req, res) => {

    try {
        // Extract the "name" parameter from the URL
        const { search } = req.query;

        // If no name was provided in the request, return an error
        if (!search) {
            return res.status(400).json({ message: "search key is required" });
        }

        // Search for a student using a case-insensitive match.
        const regex = new RegExp(search, "i");
        const students = await Enroll.find({
            $or: [
                {firstname: regex},
                {lastname: regex}
            ]
        },
        {
            firstname: 1,
            lastname: 1,
            email: 1,
            gender: 1,
            track: 1,
            attendance: 1
        }
    )

    if (students.length === 0){
        return res.status(404).json({message: "Name is not found"})
    }

    if (students.length === 0) {
            return res.status(404).json({ message: "No students found for this track" });
        }
        
        // Prepare the result for each student found
        const results = students.map(student => ({
            name: `${student.firstname} ${student.lastname}`,
            email: student.email,
            gender: student.gender,
            learningTrack: student.track,
            attendanceCount: student.attendance.length,
            presence: student.attendance.filter(s => s.status === "present").length,
            absence: student.attendance.filter(s => s.status === "absent").length,
            records: student.attendance
        }));

        res.status(200).json({message: "Attendance filtered by name suceffully.",
            count: results.length,
            data: results
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }

}


// export const markAttendance = async (req, res, next)=>{
//     try {
//         //1 Retrieve the Security Headers(injected by Electron)
//         const deviceStatus = req.headers['x-device-status'];
//         const studentMac = req.headers['x-student-mac'];

//         //2. security logic :Block if not verified
//         if (deviceStatus !== 'verified') {
//             let message = "Access denied.";

//         if (!deviceStatus) {
//           // Header is missing -> User is likely on Chrome/another browser
//           message = "You are using a web browser. Please open the school's desktop app to mark attendance.";
//         } else if (deviceStatus === 'denied_ip') {
//             message = ` This device (${studentMac}) is not registered. Please contact the administrator.`;
//         }else if (deviceStatus === 'error message') {
//             message = " Network error: Could not verify device identity. Please check your connection and try again.";
//         }

//         // Return 403 forbidden ( This triggers the specific alert on your front-end)
//         return res.status(403).json({ success: false, message: message });
//     }
        
//         console.log(`Authorized Request from MAC: ${studentMac}`);

//         const {email} = req.body;
//         // Validation - Check if email is provided
//         if(!email)
//             return res.status(400).json({message: "Provide a valid email"})
    

//     const student = await enroll.findOne({email});

//     if (!student) {
//        return res.status(400).json({message: "Student not enrolled!"}) 
//     }
//     const today = new Date()

//     if (isWeekendWeekend(today)) {
//         return res.status(400).json({message: "Attendance cannot be marked on weekend!"})
//     }
    
//     const startOfDay = getStartOfDay(today)
//     const endOfDay = getEndOfDay(today)

//     if (today<startOfDay) {
//         return res.status(400).json({message: "you cannot mark attendance yet!"}) 
//     }

//     if (today>endOfDay) {
//         return res.status(400).json({message: "you cannot mark attendance for today anymore!"})
//     }

//     const allreadyMarked = student.attendance.some((record) =>{
//         const recordDate = new Date(record.date);
//         return recordDate >= startOfDay && recordDate <= endOfDay;
//     });
    
//     if (allreadyMarked) {
//         return res.status(400).json({message: "Attendance already marked today!"});
//     }

//     // saving the MAC address to the database record too!

//     student.attendance.push({
//         date: today,
//         status: "present"
//     });
//     await student.save();

//     return res.status(200).json({message: "Attendance marked Successfully!"});             


//     } catch (error) {
//         console.error("Attendance error:", error);
//         return res.status(500).json({message: "Something went wrong!", error: error.message});  
//     }
// };