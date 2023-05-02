//review rating create At //ref to tour //ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');
const reviewsSchema = new mongoose.Schema(
    {
        review:
        {type:String,
        required:[true, 'Review cannot be empty']
        },
        rating:
        {type:Number,
            min:1,
            max:5,
        },
        createdAt:{
            type:Date,
            default:Date.now()
        },
        tour:
            { type:mongoose.Schema.ObjectId,
             ref:'Tour',
             required:[true,'review must belong to tour']
             },
         user:
            { type:mongoose.Schema.ObjectId,
             ref:'User',
             required:[true,'review must belong to user']
             }
         
    },
    {
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
);
//user can give review on on tour only once
reviewsSchema.index({tour:1,user:1},{unique:true});

reviewsSchema.pre(/^find/,function(next)
{
    // this.populate({
    //     path: 'tour',
    //     select:'name'
    // }).populate(
    //     {
    //         path:'user',
    //         select: 'name photo'
    //     }
    // )
    this.populate(
        {
            path:'user',
            select: 'name photo'
        }
    )
    next();

})

reviewsSchema.statics.calcAverageRatings = async function(tourId)
{
  const stats = await  this.aggregate([
        {
        $match: {tour:tourId}
        },
        {
            $group:{
                _id:'$tour',
                nRating:{$sum:1},
                avgRating:{$avg:'$rating'}
            }
        }
    ]);
   // console.log(stats);
    if(stats.length>0)
        {
  await  Tour.findByIdAndUpdate(tourId,{
        ratingsQuantity:stats[0].nRating,
        ratingsAverage:stats[0].avgRating
    })

}
else
{
    await  Tour.findByIdAndUpdate(tourId,{
        ratingsQuantity:0,
        ratingsAverage:4.5
    })
}
}
reviewsSchema.post('save',function()
{
    this.constructor.calcAverageRatings(this.tour); 
// next();
})

//findByIdAndUpdate and FindByidAndDelete
reviewsSchema.pre(/^findOneAnd/,async function(next)
{
   this.r =  await this.findOne();
  // console.log(this.r);
next();
})
/*This feature not working */

reviewsSchema.post(/^findOneAnd/, async function()
{
    //v does not work here because query is already executed
    if (!this._id ) return;
await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review',reviewsSchema);  
module.exports = Review;