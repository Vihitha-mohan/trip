const express =require('express');
const morgan = require('morgan');
const path = require('path');
const app= express();
const fs=require('fs')
const userRouter = require('./routes/UserRoutes');
const tourRouter = require('./routes/tourRoutes');
const viewRouter = require('./routes/viewRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController') ;
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss= require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cors = require("cors");
app.use(cors());
const cookieParser = require('cookie-parser');

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));
//Start express code

//set security http
// app.use(helmet());

if(process.env.NODE_ENV === 'development')
{
    app.use(morgan('dev'));
}


//limit reuest from same ip
const limiter=rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:'Too many requests from the ip please try again in an hour'
})


app.use('/api',limiter);


//Reading data from req.body
app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({extended:true,limit:'10kb'}));
app.use(cookieParser());



//Data SAnitisation against noSQl query injection 
app.use(mongoSanitize());


//Data sanitisation against Xss
app.use(xss());

//parameter protection
app.use(hpp({
    whitelist:[
        'duration','ratingsQuality','ratingsAverage','maxGroupSize','difficulty','price'
    ]
}));


app.use(compression());
app.use(express.static(path.join(__dirname,'public')));


// app.get('/api/v1/tours',getTours);
// app.get('/api/v1/tours/:id',getaTour);
// app.post('/api/v1/tours',createTour);
// app.patch('/api/v1/tours/:id',updateTour);
// app.delete('/api/v1/tours/:id',deleteTour);


// app.route('/api/v1/tours').get(getTours).post(createTour);
// app.route('/api/v1/tours/:id').get(getaTour).patch(updateTour).delete(deleteTour);

// app.route('/api/vi/users').get(getUsers).post(createUser);
// app.route('/api/v1/users/:id').get(getaUser).patch(updateUser).delete(deleteUser);


app.use((req,res,next)=>
{
//console.log(req.cookies);
next();
})





app.use('/',viewRouter);
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/bookings',bookingRouter);

//only if it is not handled by other routes it reaches here
//all includes get post put patch
app.all('*',(req,res,next)=>{
    // res.status(404).json({
    //     status:'fail',
    //     message:`Cant find ${req.originalUrl} on this server`
    // })
    // const err = new Error(`Cant find ${req.originalUrl} on this server`);
    // err.status = 'fail';
    // err.statusCode = 404;
    // next(err);
    next(new AppError(`Cant find ${req.originalUrl} on this server`,404));
})

app.use(globalErrorHandler);

module.exports=app;