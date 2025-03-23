import mongoose,{Schema,model} from "mongoose";

const userSchema= new Schema({
    username:String,
    email:String,
    password:String,
    age:Number,
    profilePic:{
        type:String,
        default:"default.png"
    },
    posts:[{type:mongoose.Schema.Types.ObjectId,ref:"post"}]
})


export const User= model("User",userSchema);