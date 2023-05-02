const dotenv=require('dotenv');
const mongoose =require('mongoose');
dotenv.config({path:'./config.env'});
const app=require('./app');

process.on('uncaughtException',err=>{
    console.log('UNCAUGHT REJECTION');
console.log(err.name,err.message);
process.exit(1);

})

const DB='mongodb+srv://vvvv:nithin@09@cluster0.hn23uzh.mongodb.net/natours-test?retryWrites=true&w=majority'

mongoose.connect(DB,{
 //mongoose.connect(process.env.DATABASE_LOCAL,{ //Connect Local db
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology: true
})
.then(con=>{
   // console.log(con.connection)
console.log('DB connection successful');
});

// const testtour = new Tour({
//     name:'Forest Hiker 2',
//     rating:3
// })
// testtour.save().then(doc=>{console.log(doc)
// }).catch(err => {
//     console.log('ERROR',err)
// })



//console.log(process.env);
const port = process.env.PORT||3000;
const server = app.listen(port,()=>
{
    console.log("Listening at port 3000");
})
process.on('unhandledRejection',err=>{
console.log('UNHANDLED REJECTION');
console.log(err.name,err.message);
server.close(()=>{
process.exit(1);
});
});
