const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeature = require('../utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async(req,res,next)=>
    {
    const doc = await  Model.findByIdAndDelete(req.params.id);
    if(!doc)
    {
      return next(new AppError('No document found with ID',404))
    }
      res.status(204).json({
        status:'success',
        data:null
      })
    }) 


    exports.updateOne = Model =>  catchAsync(async(req,res,next)=>
    {
       const doc = await Model.findByIdAndUpdate(req.params.id,req.body,{
        new :true,runValidators:true
       })
    
       if(!doc)
       {
         return next(new AppError('No document found with ID',404))
       }
      res.status(200).json({
        status:'success',
        data:{
            data : doc
        }
      })
    
    }
    )

    exports.createOne = Model => catchAsync(async (req,res,next)=>
    { 
        const doc = await Model.create(req.body);
        res.status(201).json({
            status:"success",
            data:{
                data:doc
            }
        });
    }
    )

    exports.getOne = (Model,PopOptions) =>catchAsync(async(req,res,next)=>
    {
       let query = Model.findById(req.params.id);
       if(PopOptions)
       {
        query = query.populate(PopOptions);
       }
    
        const doc=await query;
        if(!doc)
        {
          return next(new AppError('No document found with ID',404))
        }
      res.status(200).json({
        status:'success',
        data:{
            data:doc
        }
      })
    }
    )
    
    exports.getAll =Model => catchAsync(async (req,res,next)=>
    {
        //to ALLOW nested reviews on tour
        let filter={};
        if(req.params.tourid)
        filter= {tour:req.params.tourid};

    const features = new APIFeature(Model.find(filter),req.query).filter().sort().limitFields().paginate();
    //const doc = await features.query.explain();
    const doc = await features.query;
        res.status(200).json({
            status:'success',
            results:doc.length,
            data:{
                data:doc
            }
        })
    
      }
    )