import {Router} from 'express';
import {enroll, allstudents} from '../Controllers/enroll.controller.js'



const enrollRouter = Router()

enrollRouter.post("/enroll", enroll)
enrollRouter.get('/students', allstudents)



export default enrollRouter