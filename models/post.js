 const mongoose=require('mongoose');

const postSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    image: {
        // data: Buffer,
        type: String,
        required:true
      },
      price:{
        type:Number,
        required:true
      },
      number:{
        type:String,
        required:true
      },
      college:{
        type:String,
        required:true
      },
      createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    },
    upiId:{
        type:String,
        required:true
        
    },
    description:{
      type:String,
      required:true
    }

});

module.exports=mongoose.model('post',postSchema);