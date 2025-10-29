import mongoose from "mongoose";
const {Schema} = mongoose;

const authSchema = new Schema({
    name: {
        type: String,
        trim: true,
        minLenght: [4, "Name must be at least Four Characters"],
        // maxLenght: [30, "Name Must not Exceed 30 Characters"],
        required: [true, "please enter your name"]
    },

    email: {
        type: String,
        trim: true,
        required: [true, "Please enter your email"],
        lowercase: true,
        match: [/\S+@\S+\.\S+/, "Email is invalid"],
        minLenght: [10, "Email must be atleast 10 Characters"],
        
    },

    password: {
        type: String,
        trim: true,
        required: [true, "Please enter your password"],
        minLenght: [8, "Password must be atleast 8 Characters"],
        
    },

    track: {
        type: String,
        enum: [
            "Backend Development",
            "Fullstack Development",
            "Cloud Computing",
            "Cyber security",
            "cloud computing",

        ],
        required: true,
    }
},
{
    timestamps: true
})

const Auth = mongoose.model("Auth", authSchema);
export default Auth