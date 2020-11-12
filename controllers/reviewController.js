const Review = require('../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

//? Get All Reviews
exports.getAllReviews = factory.getAll(Review);

//? Get Review indivial review
exports.getReview = factory.getOne(Review);

//? Create Review
//* 1 Middle ware for check tour id and user id
exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
//* 2 Create Review
exports.createReview = factory.createOne(Review);

//? Update Review
exports.updateReview = factory.updateOne(Review);

//? Delete  Review
exports.deleteReview = factory.deleteOne(Review);
