const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    pass:{
        type:String,
        required:true,
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
});


const User = mongoose.model("User", userSchema);

module.exports = {User};