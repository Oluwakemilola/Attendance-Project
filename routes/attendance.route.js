import { Router } from "express";
import {markAttendance, autoMarkAbsence} from "../Controllers/attendance.controllers.js"

const attendanceRouter = Router();

attendanceRouter.post("/mark", markAttendance);          // Mark attendance
attendanceRouter.post("/automarkabsence", autoMarkAbsence); // Get monthly summary

export default attendanceRouter;
