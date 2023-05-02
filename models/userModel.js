const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
name:{
    type:String,
    required:[true,'a name is a must']
},
email:{
    type:String,
    required:[true,'a email is a must'],
    unique:true,
    lowercase:true, //transform email to lowercase
    validate:[validator.isEmail,'Please provide valid email']
},
photo:{type:String,
default:'default.jpg'},
role:{
    type:String,
    enum:['user','guide','tour-guide','admin'],
    default:'user'
},
password:{
    type:String,
    required:[true,'a pass is a must'],
    minlength:8,
    select:false
},
passwordconfirm:{
    type:String,
    required:[true,'a confirm pass is a must'],
    validate:{
        //it only users on save
        validator:function(el)
        {
            return el === this.password;
        },
        message:'Pass are not the same'
    }
},
passwordChangedAt : Date,
passwordResetToken:String,
passwordResetExpires:Date,
active:{
    type:Boolean,
    default:true,
    select:false
}
});

userSchema.pre('save',async function(next){
    if(!this.isModified('password'))
    {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordconfirm = undefined; //dont have ot save in password
    next();

});

userSchema.pre('save',function(next)
{
if(!this.isModified('password')||this.isNew)
return next();
this.passwordChangedAt = Date.now()-1000;
next();
});


userSchema.pre(/^find/,function(next){
this.find({active: {$ne:false}});
next();
});

userSchema.methods.correctPassword = async function(candidatePassword,userPassword)
{
    return await bcrypt.compare(candidatePassword,userPassword); //to encrpt the login password and compare with the encrypted pass that is save we use bcrypt.compare
}

userSchema.methods.changedPasswordAfter = function(JWTTimeStamp){
   
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
     //   console.log(changedTimeStamp, JWTTimeStamp);
        return JWTTimeStamp <changedTimeStamp;
    }
    return false;
}


userSchema.methods.createPasswordResetPassword =  function()
{
const resetToken = crypto.randomBytes(32).toString('hex');
this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//console.log({resetToken} ,this.passwordResetToken);
this.passwordResetExpires = Date.now() + 10*60*1000;

return resetToken;

}
const User = mongoose.model('User',userSchema);
module.exports = User;