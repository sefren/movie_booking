import express from 'express';
import {
  getScreens,
  getScreenById,
  createScreen,
  updateScreen,
  deleteScreen,
} from '../controllers/screenController.js';

const router = express.Router();

router.route('/').get(getScreens).post(createScreen);

router.route('/:id').get(getScreenById).put(updateScreen).delete(deleteScreen);

export default router;
