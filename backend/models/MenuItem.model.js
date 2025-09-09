import mongoose, { Schema } from "mongoose";

const menuItemSchema = new Schema({
    vendor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Vendor",
        required:true,
        index: true,
    },

    name:{
        type: String,
        required:true,
    },
    category:{  // Dessert, Appetizer, Main Course, etc
        type: String,
        required:true,
    },
    description:{
        type: String,
    },
    price:{
        type: Number,
        required:true,
    },
    
    image:{
        url:String,
        public_id:String   
    },

    isAvailable:{
        type: Boolean,
        required:true,
        default:true
    },

},{timestamps:true})

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;