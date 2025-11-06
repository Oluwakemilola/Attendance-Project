import { Router } from "express";
import {
  markAttendance,
  getMonthlyAttendance,
} from "../Controllers/attendance.controllers.js"

const attendRouter = Router();

attendRouter.post("/mark", markAttendance);          // Mark attendance
attendRouter.post("/summary", getMonthlyAttendance); // Get monthly summary

export default attendRouter;
