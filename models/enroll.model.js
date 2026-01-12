import mongoose from 'mongoose';
const attendanceSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    }, 
    status: {
        type: String,
        enum: [
            'present',
            'absent'
        ], 
        default: 'present',
        required:true
    }, 
}, 
  {_id: false
    
})

// Enroll schema
const enrollSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required:  [true, "Please enter your first Name"],
        trim: true,
    },
    lastname: {
        type: String,
        required: [true, "Please enter your Last Name"],
        trim : true
    },
    email: {
        type:String,
        required: true,
        trim: true,
        unique: true,
        match: [/\S+@\S+\.\S+/, "Email is invalid"],
        lowercase: true 
    },
    
    
    phonenumber: {
        type: String,
        required: [true, "Please enter phone Number"],
        unique: true,
        // match: [/^\+?[1-9]\d{1,14}$/, "Invalid Phone nunber"],
    },
    gender: {
        type: String,
        required: true,
       enum :  [
    "female",
    "male"
],
    },
    learningtrack: {
        type: String,
        required: true,
        enum: [
            "Backend Development",
            "Fullstack Development",
            "Cloud Computing",
            "Cyber security",
            "Data Analytics",

        ],
        
    },
    attendance: {
        type: [attendanceSchema],
        default: []


    }
},
{
    timestamps:true
}
)
// helps us search using index
enrollSchema.index({email: 1});
enrollSchema.index({"attendance.date": 1});

enrollSchema.virtual("fullname").get(function () {
    return `${this.firstname} ${this.lastname}`
})

// To get attendance Percentage 
enrollSchema.methods.getAttendancePercentage = function () {
    //step 1: Check if student has attendance record
    if(this.attendance.length === 0) return 0;

    //step 2: Count how many times they were present

    const presentCount = this.attendance.filter((record) => record.status === "present").length

return ((presentCount / this.attendance.length) * 100).toFixed(2)
}


//To get attendance data

enrollSchema.method.getAttendanceByDateRange = function (startDate, endDate) {
    return this.attendance.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
    })
}































// enrollSchema.index({email: 1});
// enrollSchema.index({"attendance.date": 1})

// //combine firstname and LAstName togetherto search faster using fullname

// enrollSchema.virtual("fullname").get(function (){
//     return `${this.firstname} ${this.lastname}`
// })

// enrollSchema.methods.getAttendancePercentage = function (){
//     //step 1: Check if student has attendance record
//     if(this.attendance.lenght === 0) return 0;

//     //step 2: count how many times they were present

//     const presentCount = this.atttendance.filter((record) => record.status === "present").lenght;

//     // step 3: calculate the percentage
//     // formula: (present days/ total days) * 100

//     return ((presentCount / this.attendance.lenght)* 100).toFixed(2)
// }

// // method to get attendance by date range
// enrollSchema.methods.getAttendanceByDataRange = function (startDate, endDate) {
//     return this.attendance.filter((record)=> {
//         const recordDate = new Date(record.date);
//         return recordDate >= startDate && recordDate <= endDate;
//     })

// }

// enrollSchema.statics.findLowAttendanceStudents = async (threshold = 75)=> {
//     //step 1: Get all students from database
//     const students = await this.find({});

//     //step 2: filter students with attendance below threshold
//     return students.filter((student) => {
//         const percentage = student.getAttendancePercentage();
//       return parseFloat(percentage) < threshold;
//     })
// }

 const Enroll = mongoose.model("Enroll", enrollSchema)
 export default Enroll
