const mongoose =require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const tourSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'a name is must'],
        unique:true,
        trim:true,
        maxlength:[40,'max 40 characters'],
        minlength:[10,'min 10 characters']
      //  validate:[validator.isAlpha, 'Should only be letter']
    },
    slug:String,
    secrettour:{
    type:Boolean,
    default:false
    },
    duration:{
        type:Number,
        required:[true,'a tour must have a duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true,'a tour must have a group size']
    },
    difficulty:{
        type:String,
        required:[true,'a tour must have a difficulty'],
        enum:{
        values:    ['easy','medium','difficult'],
        message:'Difficulty is either easy medium or difficult'
    }
    },
    ratingsAverage:{
    type:Number,
     default:4.5,
     min:[1,'Betwwen 1 and 5'],
     max:[5,'Betwwen 1 and 5'],
     set:val =>Math.round(val*10)/10
    },
    ratingsQuantity:{
        type:Number,
         default:0  
    },
    price:{
        type:Number,
        required:[true,'a tour must have a price']
    },
    priceDiscount:{
      type:  Number,
      validate:
      {
        //this points to current doument only on NEW
      validator:  function(val){
        return val <this.price;
      },
      message:'Discount price ({VALUE})should be less than regular price'
    }},
    summary:{
        type:String,
        trim:true
    },
    description:{
        type:String,
      /*  required:[true,'a tour must have a description'],*/
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,'a tour must have a cover images']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now()
    },
    startDates:[Date],
    startLocation: {
        //GeoJSON
        type:{
        type:'String',
        default:'Point',
        enum:['Point']
        },
        coordinates:[Number],
        address :String,
        description :String
        },
    locations:[
        {
            type:{
                type:String,
                default:'Point',
                enum:['Point']
            },
            coordinates:[Number],
            address : String,
            description : String,
            day:Number
        }
    ],
    guides:[
       { type:mongoose.Schema.ObjectId,
        ref:'User'
        }
    ]
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});
//1- asc -1 des
// tourSchema.index({price:1});
tourSchema.index({price:1,ratingsAverage:-1});
tourSchema.index({slug:1});
tourSchema.index({startLocation:'2dsphere'});

tourSchema.virtual('durationWeeks').get(function (){
    return this.duration/7;
});

//virtual populate
tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',
    localField:'_id'
});

//DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save',function(next){
 this.slug= slugify(this.name,{lower:true});
 next();
})

// //Multiple pre middlewear is allowed to use
// tourSchema.pre('save',function(next){
//     console.log("This is document...");
//     next();
// }
// )

// //POST MIDDLEWARE exected after all middlewear
// tourSchema.post('save',function(doc,next){
//     console.log(doc);
//     next();
// })


//QUERY MIDDLEWARE :Executed before and after executing query
// tourSchema.pre('find',function(next){
    tourSchema.pre(/^find/,function(next){ //find gindOne findOneand delete ......

        this.find({secrettour:{$ne:true}})
            next();
        })

        tourSchema.pre(/^find/,function(next)
        {
            this.populate({path:'guides',select:'-__v -passwordChangedAt'});
        next();
        })
        
    tourSchema.post(/^find/,function(docs,next){
       // console.log(docs);
        next();
    })


    //AGGREGATION MIDDLEWARE
    // tourSchema.pre('aggregate',function(next){
    //     this.pipeline().unshift({$match:{secrettour:{$ne :true}}});
    //   //  console.log(this.pipeline());
    // next();
    // })

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;