import 'reflect-metadata';
import { Router } from 'express';

import AppointmentsController from '../controllers/AppointmentsController';

import ensureAuthenticate from '@modules/users/infra/http/middlewares/ensureAuthenticate';

const appointmentsRouter = Router();
const appointmentsController = new AppointmentsController();

appointmentsRouter.use(ensureAuthenticate);
appointmentsRouter.post('/', appointmentsController.create);

export default appointmentsRouter;
