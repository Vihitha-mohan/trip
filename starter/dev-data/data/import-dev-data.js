const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const fs = require('fs');
const Tour = require('./../../../models/tourModel');
const User = require('./../../../models/userModel');
const Review = require('./../../../models/reviewModel');

const DB ='mongodb+srv://vvvv:nithin@09@cluster0.hn23uzh.mongodb.net/natours-test?retryWrites=true&w=majority';

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    // console.log(con.connection)
    console.log('DB connection successful');
  });
const tours=JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
const users=JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
const reviews=JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));

//IMPORT DATA

const importData = async()=>{
    try{
        await Tour.create(tours);
        await User.create(users,{validateBeforeSave:false});
        await Review.create(reviews);
       // console.log("Successfullly added");

    }catch(err){
        console.log(err);
    }
    process.exit();

}

//DELETE DATA
const deleteData = async()=>{
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
     //   console.log("Successfully deleted");
    }catch(err){
        console.log(err);
    }
    process.exit();
}

if(process.argv[2]==='--import'){
    importData();
}
else if(process.argv[2]==='--delete'){
deleteData();
}