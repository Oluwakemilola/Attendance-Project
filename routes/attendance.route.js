import { Router } from "express";
import {markAttendance,  
    getAttendanceByDateRange,
    getAttendanceByTrack,
    getStudentAttendance,
    getOverallAttendance,
    getAttendanceByName,
    getAllStudentWithAttendance
} from "../Controllers/attendance.controllers.js";


const attendanceRouter = Router();
attendanceRouter.post("/mark", markAttendance);          // Mark attendance
attendanceRouter.get("/overall-attendance", getOverallAttendance);
attendanceRouter.get("/students-attendance", getAllStudentWithAttendance);
attendanceRouter.get("/student/:id", getStudentAttendance);
attendanceRouter.get("/student-track/:track", getAttendanceByTrack);
attendanceRouter.get("/date-range", getAttendanceByDateRange);
attendanceRouter.get("/student-name", getAttendanceByName);

export default attendanceRouter;
