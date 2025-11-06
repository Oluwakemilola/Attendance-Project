import {Router} from 'express';
import {enroll, allstudents, markAttendance} from '../Controllers/enroll.controller.js'



const enrollRouter = Router()

enrollRouter.post("/enroll", enroll)
enrollRouter.get('/students', allstudents)
enrollRouter.post('/attendance', markAttendance)


export default enrollRouter