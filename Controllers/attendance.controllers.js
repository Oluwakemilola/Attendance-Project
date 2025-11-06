import mongoose from "mongoose";
import Enroll from "../models/enroll.model.js";


 //MARK ATTENDANCE CONTROLLER
 
export const markAttendance = async (req, res) => {
  try {
    const { email, phonenumber, status } = req.body;
    const attendanceStatus = status || "present";
    const currentDate = new Date();

    // Validate input
    if (!email || !phonenumber) {
      return res.status(400).json({
        message: "Email and phone number are required",
      });
    }

    // Find student by email and phone number
    const student = await Enroll.findOne({
      email: email.toLowerCase(),
      phonenumber,
    });

    if (!student) {
      return res.status(404).json({
        message: "No student found with the provided email and phone number",
      });
    }

    // Prevent duplicate attendance for the same day
    const today = currentDate.toISOString().split("T")[0];
    const existingRecord = student.attendance.find(
      (record) => record.date.toISOString().split("T")[0] === today
    );

    if (existingRecord) {
      return res.status(400).json({
        message: "Attendance already marked for today",
      });
    }

    // Mark attendance for today
    student.attendance.push({
      date: currentDate,
      status: attendanceStatus,
    });

    await student.save();

    // === Calculate Monthly Percentage (Weekdays only) ===
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Step 1: Get all weekdays this month up to today
    const weekdaysThisMonth = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const todayDate = currentDate.getDate();

    for (let day = 1; day <= todayDate; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        weekdaysThisMonth.push(date);
      }
    }

    const totalWeekdays = weekdaysThisMonth.length;

    // Step 2: Filter student's attendance for this month
    const monthlyRecords = student.attendance.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear
      );
    });

    // Step 3: Count present weekdays
    const presentDays = monthlyRecords.filter((record) => {
      const day = new Date(record.date).getDay();
      return record.status === "present" && day !== 0 && day !== 6;
    }).length;

    // Step 4: Calculate attendance percentage
    const attendancePercentage =
      totalWeekdays === 0 ? 0 : ((presentDays / totalWeekdays) * 100).toFixed(2);

    // Return response
    res.status(200).json({
      message: "Attendance marked successfully",
      student: {
        firstname: student.firstname,
        lastname: student.lastname,
        email: student.email,
        learningtrack: student.learningtrack,
        markedDate: today,
        status: attendanceStatus,
      },
      monthlyAttendance: {
        month: currentDate.toLocaleString("default", { month: "long" }),
        presentDays,
        totalWeekdays,
        percentage: `${attendancePercentage}%`,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error. Could not mark attendance.",
    });
  }
};

/**
 * GET MONTHLY ATTENDANCE SUMMARY
 * ---------------------------------------------
 * - Returns a student's attendance summary for a given month/year.
 * - Excludes weekends (Sat/Sun) from the total days.
 */
export const getMonthlyAttendance = async (req, res) => {
  try {
    const { email, phonenumber, month, year } = req.body;

    if (!email || !phonenumber || !month || !year) {
      return res.status(400).json({
        message: "Email, phone number, month, and year are required",
      });
    }

    const student = await Enroll.findOne({
      email: email.toLowerCase(),
      phonenumber,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    const targetYear = Number(year);

    // Step 1: Get all weekdays for the target month
    const weekdays = [];
    const daysInMonth = new Date(targetYear, monthIndex + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, monthIndex, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        weekdays.push(date);
      }
    }

    const totalWeekdays = weekdays.length;

    // Step 2: Filter attendance for the target month
    const monthlyRecords = student.attendance.filter((record) => {
      const d = new Date(record.date);
      return d.getMonth() === monthIndex && d.getFullYear() === targetYear;
    });

    // Step 3: Count present weekdays
    const presentDays = monthlyRecords.filter((record) => {
      const d = new Date(record.date);
      const dayOfWeek = d.getDay();
      return record.status === "present" && dayOfWeek !== 0 && dayOfWeek !== 6;
    }).length;

    // Step 4: Calculate percentage
    const percentage =
      totalWeekdays === 0 ? 0 : ((presentDays / totalWeekdays) * 100).toFixed(2);

    res.status(200).json({
      message: "Monthly attendance summary retrieved successfully",
      student: {
        firstname: student.firstname,
        lastname: student.lastname,
        email: student.email,
        learningtrack: student.learningtrack,
      },
      summary: {
        month,
        year,
        presentDays,
        totalWeekdays,
        percentage: `${percentage}%`,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error. Could not retrieve attendance summary.",
    });
  }
};
