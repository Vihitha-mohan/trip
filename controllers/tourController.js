const { query } = require('express');
const Tour = require('./../models/tourModel')
const APIFeature = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('../controllers/handlerFactory');
const multer = require('multer');
const sharp = require('sharp');


const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb)=>
{
  if(file.mimetype.startsWith('image'))
  {
    cb(null,true);
  }
  else
  {
    cb(new AppError('Not a image,please upload only image',400),false);
  }
}


const upload = multer({
  storage:multerStorage,
  fileFilter:multerFilter
});

exports.uploadTourImages = upload.fields([
  {
    name:'imageCover',maxCount:1
  },
  {
    name:'images',maxCount:3
  }

]);

exports.resizeTourImages =catchAsync( async(req,res,next)=>
{
if(!req.files.imageCover || !req.files.images)
return next();
const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
await sharp(req.files.imageCover[0].buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/tours/${imageCoverFilename}`);
req.body.imageCover = imageCoverFilename;

req.body.images=[];
await Promise.all(req.files.images.map(async (file,i) => {
  const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
  await sharp(file.buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/tours/${filename}`);
req.body.images.push(filename);
})
);

next();
});
exports.aliasTopTours=(req,res,next)=>{
  req.query.limit=5;
  req.query.sort='ratingAverage,price';
  req.query.fields='name,price,ratingAverage';
  next();
} 



// exports.checkBody=(req,res,next)=>
// {
// if(!req.body.name || !req.body.price){
//   return res.status(400).json({
//    status:'fail',
//    message:'Missing name or price'
//   })
// }
// next();
// }


exports.getTours = factory.getAll(Tour);
// exports.getTours=catchAsync(async (req,res,next)=>
// {

// //     //1a Filtering Obj
// //     const queryObj={...req.query};
// //     const excludedFields=['page','limit','sort','fields'];
// //     excludedFields.forEach(element => {
// //       delete queryObj[element]
// //     });
 
// // //1b Advanced Filtering
// // const queryStr=JSON.stringify(queryObj);
// // const new_queryStr=queryStr.replace(/\b{gte|gt|lt|lte}\b/g,match=>`$${match}`);
// // console.log(JSON.parse(new_queryStr));

// //  let query =  Tour.find(JSON.parse(new_queryStr));  //cant use await here because it returns query and performing sort and other operation cant be done

// // const query = Tour.find()
// // .where('duration')
// // .equals(5);


// //2. Sorting
// // if(req.query.sort)
// // {
// //   const sortBy = req.query.sort.split(',').join(' ');
// //   query=query.sort(sortBy);
// // }else
// // {
// //   query=query.sort('-createdAt');
// // }


// //3 Field limiting
// // if(req.query.fields)
// // {
// //   const fields=req.query.fields.split(',').join(' ');
// //   query=query.select('name duration price');
// // }
// // else
// // {
// //   query=query.select('-__v');
// // }

// //Pagination
// // const page=req.query.page*1||1;
// // const limit=req.query.limit*1||100;
// // const skip=(page-1)*limit;
// // query=query.skip(skip).limit(limit);

// // //page beyond rage
// // if(req.query.page)
// // {
// //   const numTours=await Tour.countDocuments();
// //   if(skip>=numTours) throw new Error('This page does not exist');
// // }

// //Execute query 
// // const tours = await query;
// const features = new APIFeature(Tour.find(),req.query).filter().sort().limitFields().paginate();
// const tours = await features.query;

//     res.status(200).json({
//         status:'success',
//         results:tours.length,
//         data:{
//             tours:tours
//         }
//     })

//   }
// )
// exports.getaTour=catchAsync(async(req,res,next)=>
// {

//     const tours=await Tour.findById(req.params.id).populate('reviews');
//     if(!tours)
//     {
//       return next(new AppError('No tour found with ID',404))
//     }
//   res.status(200).json({
//     status:'success',
//     data:{
//         tours:tours
//     }
//   })
// }
// )

exports.getaTour = factory.getOne(Tour,{path:'reviews'});


// exports.createTour=catchAsync(async (req,res,next)=>
// { 
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//         status:"success",
//         data:{
//             tours:newTour
//         }
//     });
// }
// )


exports.createTour = factory.createOne(Tour);
// exports.updateTour = catchAsync(async(req,res,next)=>
// {
//    const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{
//     new :true,runValidators:true
//    })

//    if(!tour)
//    {
//      return next(new AppError('No tour found with ID',404))
//    }
//   res.status(200).json({
//     status:'success',
//     data:{
//         tours:tour
//     }
//   })

// }
// )

exports.updateTour = factory.updateOne(Tour);



// exports.deleteTour=catchAsync(async(req,res,next)=>
// {
// const tour = await  Tour.findByIdAndDelete(req.params.id);
// if(!tour)
// {
//   return next(new AppError('No tour found with ID',404))
// }
//   res.status(204).json({
//     status:'success',
//     data:null
//   })
// })


exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats =catchAsync(async(req,res)=>{
    const stats = await Tour.aggregate([
      {
        $match:{ratingsAverage:{$gte :4.5}}
      },
      {
        $group:{
          _id:'$difficulty',
          numTours:{$sum:1},
          numRatings:{$sum:'$ratingsQuantity'},
          avgRating:{$avg:'$ratingsAverage'},
          avgPrice:{$avg:'$price'},
          minPrice:{$min:'$price'},
          maxPrice:{$max:'$price'},
        }
      },
      {
        $sort:{avgPrice:1}
      }
      // {
      //  $match:{_id :{$ne:'easy'}}
      // }
    ]);
    res.status(200).json({
      status:'success',
      data:stats
    })
}
)
exports.getMonthlyPlan = catchAsync( async(req,res,next)=>{
  const year= req.params.year*1; //2021
  const plan = await Tour.aggregate([
    {
      $unwind:'$startDates'
    },{
      $match:{
        startDates:{
          $gte:new Date(`${year}-01-01`),
          $lte:new Date(`${year}-12-31`),
        }
      }
    },{
      $group:{
        _id:{$month:'$startDates'},
        numTourStarts:{$sum:1},
        tours:{$push:'$name'}
      }
    },
    {
      $addFields:{month:'$_id'}
    },{
      $project:{
        _id:0
      }
    },
    {
      $sort:{
        numTourStarts:-1
      }
    },
    {
      $limit:12
    }
  ]); 
  res.status(200).json({
    status:'success',
    data:plan
  })
}
)

///tours-within/:distance/center/:latlng/unit/:unit
exports.getToursWithin = catchAsync(async(req,res,next)=>
{
const {distance,latlng,unit}=req.params;
const [lat,lng]=latlng.split(',');
const radius = unit ==='mi'?distance/3963.2:distance/6378.1;
if(!lat || !lng)
{
  next(new AppError('Please provide latitude and longitude in the format lat,lng',400));
}

const tours = await Tour.find({startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}});

res.status(200).json(
  {
    status:'success',
    result:tours.length,
    data:
    {
      data:tours
    }
  }
)
})


exports.getDistances = catchAsync(async (req,res,next)=>{
  const {latlng,unit}=req.params;
  const [lat,lng]=latlng.split(',');
  const multiplier = unit ==='mi' ?0.000621371 : 0.001;
  if(!lat || !lng)
  {
    next(new AppError('Please provide latitude and longitude in the format lat,lng',400));
  }

  const distances=await Tour.aggregate([
    {
      $geoNear:{
        near:{
          type:'Point',
          coordinates:[lng*1,lat*1]
        },
        distanceField:'distance',
        distanceMultiplier:multiplier
      }
    },
    {
      $project:{
        distance:1,
        name:1
      }
    }
  ]);
  res.status(200).json(
    {
      status:'success',
      data:
      {
        data:distances
      }
    }
  )
})