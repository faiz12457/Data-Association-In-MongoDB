import mongoose,{Schema,model} from "mongoose";

const postSchema= new Schema({
    postData:String,
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    date:{
        type:Date,
        default:Date.now(),
    },

    likes:[
        {type:mongoose.Schema.Types.ObjectId,ref:"User"}
    ]
    
})


export const Post= model("post",postSchema);