const crypto = require("crypto");

function generateOtp(){
    return Math.floor(100000 + Math.random() * 900000).toString();
}


function generateLink(){
    return crypto.randomBytes(32).toString("hex");
}


module.exports = {generateOtp, generateLink};