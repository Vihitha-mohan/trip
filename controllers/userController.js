const fs=require('fs');
const tours=JSON.parse(fs.readFileSync(`./starter/dev-data/data/tours-simple.json`));
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('../controllers/handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//   destination:(req,file,cb)=>
//   {
//     cb(null,'public/img/users');
//   },
//   filename:(req,file,cb)=>{
//     const ext = file.mimetype.split('/')[1];
//     cb(null,`user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

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


exports.uploadUserPhoto =upload.single('photo');

exports.resizeUserPhoto =catchAsync( async (req,res,next)=>
{
   if(!req.file)
   return next();
   req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
   await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/users/${req.file.filename}`);
   next();

});

const filterObj = (obj, ...allowedfields)=>{
  const newObj={};
Object.keys(obj).forEach(el=>
  {
    if(allowedfields.includes(el))
    newObj[el]=obj[el];
  }) ;
  return newObj; 
}
// exports.getAllUsers =catchAsync(async (req,res,next)=>
// {
//   const users = await User.find();
//   console.log(users);

//   res.status(200).json(
//     {
//       status:'success',
//       results:users.length,
//       data:
//       {
//         users
//       }
//     }
//   )
  
// }
// )

exports.getMe = (req,res,next)=>
{
  req.params.id = req.user.id;
  next();
}

exports.getAllUsers = factory.getAll(User);

exports.updateMe = catchAsync (async(req,res,next)=>
{
  //console.log(req.file);
  //console.log(req.body);
//1.Create error if user tries to update passowrd
if(req.body.password || req.body.passwordConfirm)
{
  return next(new AppError('This route is not for password updates.Please use /updateMyPassword',400));
}

//2.Update use data
//fitered unwanted field names
const filteredBody = filterObj(req.body,'name','email');
if(req.file)
{
  filteredBody.photo = req.file.filename;
}
const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
  new:true,
  runValidators:true
});
res.status(200).json(
  {
    status:'success',
    data:{
      user:updatedUser
    }
  }
);
 //Added to redirect
 window.location.assign('/me');
});

exports.deleteMe =catchAsync(async(req,res,next)=>{

  await User.findByIdAndUpdate(req.user.id,{active:false})
  res.status(204).json(
    {
      status:'success',
      data:null
    }
  )
}

)

exports.getUsers=(req,res)=>{
    res.status(201).json({
      status:'error',
      message : 'Not defined yet'
    })
  }
  
  exports.createUser=(req,res)=>{
    res.status(500).json({
      status:'error',
      message : 'Not defined yet. Please use /signup'
    })
  }
  
  // exports. updateUser=(req,res)=>{
  //   res.status(500).json({
  //     status:'error',
  //     message : 'Not defined yet'
  //   })
  // }
//Do not update pass with this
  exports.updateUser = factory.updateOne(User);
  // exports. deleteUser=(req,res)=>{
  //   res.status(500).json({
  //     status:'error',
  //     message : 'Not defined yet'
  //   })
  // }


  exports.deleteUser = factory.deleteOne(User);
  // exports. getaUser=(req,res)=>{
  //   res.status(500).json({
  //     status:'error',
  //     message : 'Not defined yet'
  //   })
  // }


  exports.getaUser = factory.getOne(User);
