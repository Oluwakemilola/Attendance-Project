import { Router } from "express";
import {markAttendance, 
    autoMarkAbsence, 
    getAttendanceByDateRange,
    filterByTrack
} from "../Controllers/attendance.controllers.js";


const attendanceRouter = Router();

attendanceRouter.get("/filterbydays", getAttendanceByDateRange )
attendanceRouter.get("/filterbytrack", filterByTrack)
attendanceRouter.post("/mark", markAttendance);          // Mark attendance
attendanceRouter.post("/automarkabsence", autoMarkAbsence); // Get monthly summary



export default attendanceRouter;
