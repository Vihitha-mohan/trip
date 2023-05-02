const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModels');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { updateUser } = require('./userController');
exports.getOverview = catchAsync(async(req,res,next)=>
{

    //1.GET TOUR DATA
    const tours = await Tour.find();

    //2.bUILD TEMPLATE


    //3.rENDER THE TEMPLATE
    //console.log(tours);
    res.status(200).render('overview',{
        title:'All Tours',
        tours
    });
})

exports.getTour =catchAsync( async(req,res,next)=>
{
    const tour = await Tour.findOne({slug:req.params.slug}).populate({
        path:'reviews',
        fields:'review rating user'
    })

    if(!tour)
    {
        return next(new AppError('There is no tour with that name.',404));
    }
  
       res.status(200).render('tour',{
        title:`${tour.name} Tour`,
        tour
    });
})

exports.getLoginForm =  (reg,res)=>
{

    res.status(200).render('login',{
        title:'Login',
    });
}

exports.getAccount = (req,res)=>
{
    res.status(200).render('account',{
        title:'Your account',
    });   
}

exports.getMyTours = catchAsync( async (req,res,next)=>
{
    //console.log("cxc");
    //1.Find all booking
    const bookings = await Booking.find({user:req.user.id});

    //2.Find tours with returned IDS
    const tourIDs = bookings.map(el=>el.tour);
    const tours = await Tour.find({_id:{$in:tourIDs}});
res.status(200).render('overview',{
    title:'My tours',
    tours
});
});

exports.updateUserData = catchAsync(async (req,res,next)=>
{
    const updatedUser = await User.findByIdAndUpdate(req.user.id,{
        name:req.body.name,
        email:req.body.email
    },{
        new:true,
        runValidators:true
    });
    res.status(200).render('account',{
        title:'Your account',
        user:updatedUser     
    });
})

