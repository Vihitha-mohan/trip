const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Review = require('../models/reviewModel');
const APIFeature = require('../utils/apiFeatures');
const factory = require('../controllers/handlerFactory');

// exports.getallreviews = catchAsync(async (req,res,next)=>
// {
//     let filter={};
//     if(req.params.tourid)
//     filter= {tour:req.params.tourid};


//     const reviews=await Review.find(filter);

//   res.status(200).json({
//     status:'success',
//     results:reviews.length,
//     data:{
//         reviews:reviews
//     }
//   })
  
// })

exports.setTourUserIds = (req,res,next)=>{
    if(!req.body.tour)
    req.body.tour=req.params.tourid;
    if(!req.body.user)
    req.body.user=req.user.id;
    next();
}
exports.getallreviews = factory.getAll(Review);
// exports.createreview=catchAsync(async (req,res,next)=>
// {
//     //Allow ne
  
//     if(!req.body.tour)
//     {
//     req.body.tour=req.params.tourid;
 
//     }
//     if(!req.body.user)
//     req.body.user=req.user.id;
//     const newreview = await Review.create(req.body);
//     res.status(201).json({
//         status:"success",
//         data:{
//             review:newreview
//         }
//     });
// })

exports.createreview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review);