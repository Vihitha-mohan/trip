class APIFeature{
    constructor(query,queryString){
      this.query=query;
      this.queryString=queryString;
    }
    filter()
    {
      
        //1a Filtering Obj
        const queryObj={...this.queryString};
        const excludedFields=['page','limit','sort','fields'];
        excludedFields.forEach(element => {
          delete queryObj[element]
        })
     
    //1b Advanced Filtering
    const queryStr=JSON.stringify(queryObj);
    const new_queryStr=queryStr.replace(/\b{gte|gt|lt|lte}\b/g,match=>`$${match}`);
     this.query=this.query.find(JSON.parse(new_queryStr));
    
   //  let query =  Tour.find(JSON.parse(new_queryStr));
   return this; //return entire object ti execute next query
    }
    sort()
    {
      if(this.queryString.sort)
  {
    const sortBy = this.queryString.sort.split(',').join(' ');
    this.query=this.query.sort(sortBy);
  }else
  {
    this.query=this.query.sort('-createdAt');
  }
  return this;
    }
    limitFields()
    {
      if(this.queryString.fields)
  {
    const fields=this.queryString.fields.split(',').join(' ');
    this.query=this.query.select('name duration price');
  }
  else
  {
    this.query=this.query.select('-__v');
  }
  return this;
    }
    paginate()
    {
      const page=this.queryString.page*1||1;
      const limit=this.queryString.limit*1||100;
      const skip=(page-1)*limit;
      this.query=this.query.skip(skip).limit(limit);
      return this;
    }
  }
  module.exports=APIFeature;