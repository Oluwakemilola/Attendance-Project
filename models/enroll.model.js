import mongoose from 'mongoose';


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
        type: Number,
        required: [true, "Please enter phone Number"],
        unique: true,
        match: [/^\+?[1-9]\d{1,14}$/, "Invalid Phone nunber"],
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
            "cloud computing",

        ],
        
    },

},
{
    timestamps:true
}
)

 const Enroll = mongoose.model("Enroll", enrollSchema)
 export default Enroll
