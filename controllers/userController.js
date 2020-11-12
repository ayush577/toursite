//* Create varaible for CRUD operation - User's
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

//? Create distination and name for file using  ( diskstorage )
/* const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    // user-767e988897casdadd-3231313289734.jpeg
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
}); */

//? upload image using ( memoryStorage )
const multerStorage = multer.memoryStorage();

//? check file is either image or other
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not a image! Please upload only images', 400), false);
  }
};

//? Single image upload varibale
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//? upload picture to server
exports.uploadUserPhoto = upload.single('photo');

//?
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

//? FILTER Unwanted Objects from request - /updateme
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

//? Get User profile by current login user
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

//? Update user Infomation only name or email
exports.updateMe = catchAsync(async (req, res, next) => {
  //* 1) Create error if user POSTS password date
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }
  //* Filtered Out unwanted fields name that not allow to update
  const filteredBody = filterObj(req.body, 'name', 'email');

  //* check photo include or not
  if (req.file) filteredBody.photo = req.file.filename;

  //* 2) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

//?  Deactive User or show delete to user from user side
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//? create user using authcontroller or signup
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

//? Get All Users
exports.getAllUsers = factory.getAll(User);

//? Get Indivial User
exports.getUser = factory.getOne(User);

//? Update User Information ( Not password )
exports.updateUser = factory.updateOne(User);

//? Delete User Only Admin delete the user from data base
exports.deleteUser = factory.deleteOne(User);
