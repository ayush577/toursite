const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

//? Set PUG for express and node
app.set('view engine', 'pug');

//? Set Path of local folder
app.set('views', path.join(__dirname, 'views'));

//TODO: 1. Middlewares

//? Middleware for show or serving static file or public folder on browser
app.use(express.static(path.join(__dirname, 'public')));

//? set Security HTTP headers
app.use(helmet());

//? Bypass few security header for mapbox
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      scriptSrc: [
        "'self'",
        'https://*.cloudflare.com',
        'https://*.stripe.com',
        'https://*.mapbox.com',
      ],
      frameSrc: ["'self'", 'https://*.stripe.com'],
      objectSrc: ["'none'"],
      styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
      workerSrc: ["'self'", 'data:', 'blob:'],
      childSrc: ["'self'", 'blob:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://*.gstatic.com'],
      connectSrc: [
        "'self'",
        'blob:',
        'https://*.mapbox.com',
        'ws://127.0.0.1:*/',
      ],
      upgradeInsecureRequests: [],
    },
  })
);

//? Middleware morgon. it's make life easier and use config.env vairable for envorment vairable
//? Logging request in console
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//? limited number of request from same ip ( help use from prevent cyber attack)
const limiter = rateLimit({
  max: 300,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//*Body Parser
//? Middleware for accpeting json object from user's
app.use(express.json({ limit: '10kb' }));

//? Middleware for Pug Template - my account submit form
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//? Cookie Parser
app.use(cookieParser());

//? Data sanitization against NoSQL query Injection
app.use(mongoSanitize());

//? Data sanitization save website cross xss html attack
app.use(xss());

//? Prevent Parameter Pollution ( example: /sort=duration&sort=price);
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

/* //? Create My own Middleware
app.use((req, res, next) => {
  console.log('Hello from the middleware😃');
  next();
}); */

//? compress all text which send to client
app.use(compression());

//? test middleware
app.use((req, res, next) => {
  req.requireTime = new Date().toISOString();
  // console.log(req.cookies);
  // console.log(req.headers);
  next();
});

//TODO: 2. Router Handler & 3. Routes (routes folder)

/*//? This Routers are middleware that why we able to use app.use property We can't use this router before declare vaiarables (Mounting Routers) */

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  /* res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server !`,
  }); */

  // const err = new Error(`Can't find ${req.originalUrl} on this server !`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server !`));
});

//? middleware error controller.js
app.use(globalErrorHandler);

//TODO: 4. SERVER

module.exports = app;
