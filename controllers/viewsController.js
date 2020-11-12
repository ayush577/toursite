const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

//? Display Overview Page
exports.getOverview = catchAsync(async (req, res, next) => {
  //* 1) Get tour Data from collection
  const tours = await Tour.find();

  //* 2) Build template - **** overview.pug ****

  //* 3) Render That template using tour data from 1) point
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

//? Display Tour content according to tour
exports.getTour = catchAsync(async (req, res, next) => {
  //* 1) Get the Data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  //* 2) Build template - **** tour.pug ****

  //* 3)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

//? Login Page
exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

//? My Account
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

//? My Tours which I booked
exports.getMyTours = catchAsync(async (req, res, next) => {
  //* 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // console.log('Booking', bookings);

  //* 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  // console.log('Tours', tours);

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

//? Submit form in my account
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
