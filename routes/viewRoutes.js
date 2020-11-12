const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

//TODO - PUG template URL set

//? Overview Page
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);

//? Tour Page
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);

//? login Page
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);

//? My Account
router.get('/me', authController.protect, viewsController.getAccount);

//? My Bookings or Tours
router.get('/my-tours', authController.protect, viewsController.getMyTours);

//? for submit form in my account
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
