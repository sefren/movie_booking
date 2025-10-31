import Screen from '../models/Screen.js';

// Get all screens
export const getScreens = async (req, res, next) => {
  try {
    const screens = await Screen.find({ status: 'active' });

    res.status(200).json({
      success: true,
      data: screens,
    });
  } catch (error) {
    next(error);
  }
};

// Get screen by ID
export const getScreenById = async (req, res, next) => {
  try {
    const screen = await Screen.findById(req.params.id);

    if (!screen) {
      const error = new Error('Screen not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: screen,
    });
  } catch (error) {
    next(error);
  }
};

// Create screen
export const createScreen = async (req, res, next) => {
  try {
    const screen = await Screen.create(req.body);

    res.status(201).json({
      success: true,
      data: screen,
      message: 'Screen created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Update screen
export const updateScreen = async (req, res, next) => {
  try {
    const screen = await Screen.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!screen) {
      const error = new Error('Screen not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: screen,
      message: 'Screen updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Delete screen
export const deleteScreen = async (req, res, next) => {
  try {
    const screen = await Screen.findByIdAndDelete(req.params.id);

    if (!screen) {
      const error = new Error('Screen not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: 'Screen deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
