const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const {promisify} = require('util');
const { exitCode } = require('process');
const crypto = require('crypto');
const signToken = id =>{
    return jwt.sign({id:id},process.env.JWT_SECRET,{expiresIn :process.env.JWT_EXPIRES_IN });     
}

exports.signup = catchAsync(async(req,res,next)=>
{
    //cookie options
const newUser = await User.create({
    name:req.body.name,
    email:req.body.email,
    password:req.body.password,
    passwordconfirm:req.body.passwordconfirm,
    passwordChangedAt:req.body.passwordChangedAt,
    role:req.body.role
});
const url = `${req.protocol}://${req.get('host')}/me`;
//console.log(url);
await new Email(newUser,url).sendWelcome();

const token = signToken(newUser._id); 
const cookieOption= {
    expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE_IN*24*60*60*1000),
    httpOnly:true
}

if(process.env.NODE_ENV === 'production')cookieOption.secure = true;
res.cookie('jwt',token,cookieOption);
    res.status(201).json({
        status:'success',
        token,
        data:{
            user:newUser
        }
    
    });
    }

)
exports.login=catchAsync(async (req,res,next)=>{
const {email,password} = req.body;
//1. Check if the emailand pass exsist
if(!email || !password)
{
   
    // res.status(404).json(
    //     {
    //         status:'fail',
    //         message:'please provide valid email and password'
    //     }
        // )
 return  next(new AppError('Please provide email and password',400));

}

//2.if the user exists and password is incorrect
const user = await  User.findOne({email:email}).select('+password');

// console.log("++++++",user);
if(!user || !(await user.correctPassword(password,user.password)))
{
    return  next(new AppError('Incorrect email and password',401));
}


//If all okay them send token to client
const token = signToken(user._id);

const cookieOption= {
    expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE_IN*24*60*60*1000),
    httpOnly:true
};
    console.log("***********",process.env.JWT_COOKIE_EXPIRE_IN);
if(process.env.NODE_ENV === 'production')cookieOption.secure = true;
res.cookie('jwt',token,cookieOption);
res.status(200).json(
    {
        status:'success',
        token
    }
)
    })


exports.logout = (req,res)=>
{
    res.cookie('jwt','loggedout',{
        expires:new Date(Date.now()+10*1000),
        httpOnly:true
    })
    res.status(200).json({
        status:'success'
    }
        )
}
exports.protect = catchAsync(async (req,res,next)=>
{
    let token;
    //1.getting token and check if it exists
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    {
       token = req.headers.authorization.split(' ')[1];
    }
    else if(req.cookies.jwt)
    {
    token= req.cookies.jwt;
    }
    if(!token)
    {
        next(new AppError('You have not logged in!Please login to access',401));
    }


    //2.Verification of the token
   const decoded =  jwt.verify(token,process.env.JWT_SECRET);
 //     const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);

   //3. Check if user still exists
   const freshUser =await  User.findById(decoded.id);
   if(!freshUser)
   {
    return next(new AppError('The user belogining to this token no longer exists',401));
   }


   //4.check if user changed pass after jwt was issued
   if(freshUser.changedPasswordAfter(decoded.iat))
   {
    return next(new AppError('User recently changed password.Please login again',401));
   }
   //Grant access
   req.user =  freshUser;
   res.locals.user = freshUser;
    next();
});


exports.isLoggedIn = async (req,res,next)=>
{
     if(req.cookies.jwt)
    {
        try{
      const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);

   //3. Check if user still exists
   const freshUser =await  User.findById(decoded.id);
   if(!freshUser)
   {
    return next();
   }


   //4.check if user changed pass after jwt was issued
   if(freshUser.changedPasswordAfter(decoded.iat))
   {
    return next();
   }
   //there is logged in user
   res.locals.user = freshUser; //pass data to pug
   return next();
}catch(err)
{
    return next();
}
    }
next();
};


//roles is array. Passing parameter to mifddleware
exports.restrictTo = (...roles)=>{
    return(req,res,next)=>{
       // console.log(req.user.role);
        if(!roles.includes(req.user.role))
        {
            return next(new AppError('You do not have permission to perform this action',403));
        }
        next();  
    }
  
}

exports.forgotPassword =catchAsync (async (req,res,next)=>{
    //1. Get user based on email
    const user = await User.findOne({email:req.body.email});
    if(!user)
    {
    return next(new AppError('There is no user with that email address',404));
    }

    //2.generate random token
    const resetToken = user.createPasswordResetPassword();
    await user.save({validateBeforeSave:false});

    //Send it back as email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
 
    const message =`Forgot ur password.please submit a patch request to update ur password and conform password using
     ${resetURL}.\nIf not please ignore.`;
     try{
    // await sendEmail({
    //     email:user.email,
    //     subject:'Your password reset token. Vlid for 10mins',
    //     message
    // });
    await new Email(user,resetURL).sendPasswordReset();
    res.status(200).json(
        {
            status:'success',
            message:'Token sent to email'
        }
    )
     }
     catch(err){
      //  console.log(err);
        user.passwordResetToken=undefined,
        user.passwordResetExpires=undefined
        await user.save({validateBeforeSave:false});
        return next(new AppError('There was error sending Email. Try again',500));
     }
})

exports.resetPassword = catchAsync(async  (req,res,next)=>
{
//1.Get the user based on the token
const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
const user = await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:Date.now()}});

//2.If token has expired abd there is used we need the new password
if(!user)
{
return next(new AppError('Token has expired or invalid',400));
}

user.password = req.body.password;
user.passwordconfirm = req.body.passwordConfirm;
user.passwordResetToken=undefined;
user.passwordResetExpires=undefined;
await user.save();
//3.Update ChangePasswordAt property for the user


//4. log the user in, send JWT
const token = signToken(user._id);
const cookieOption= {
    expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE_IN*24*60*60*1000),
    httpOnly:true
}
if(process.env.NODE_ENV === 'production')cookieOption.secure = true;
 

res.cookie('jwt',token,cookieOption);
res.status(200).json(
    {
        status:'success',
        token
    }
);
});

exports.updatePassword = catchAsync(async (req,res,next)=>
{
    //1.Get the user from collection
    const user = await User.findById(req.user.id).select('+password');


    //2.Check if posted password is correct
    if(!await(user.correctPassword(req.body.passwordCurrent,user.password)))
    {
        return next(new AppError('Your current password is wrong',401));
    }

    //3.If password is correct update password
    user.password = req.body.password;
    user.passwordconfirm = req.body.passwordConfirm;
    await user.save();

    //4.Log in and send JWt 
    const token = signToken(user._id);
    const cookieOption= {
    expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE_IN*24*60*60*1000),
    httpOnly:true
}
if(process.env.NODE_ENV === 'production')cookieOption.secure = true;
res.cookie('jwt',token,cookieOption);
res.status(200).json(
    {
        status:'success',
        token
    }
);

});
