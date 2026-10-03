const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.USER,
        pass:process.env.PASS
    }
});

async function sendOtp(to, otp){
    await transporter.sendMail({
        from:"authentication",
        to,
        subject:"verify your email",
        html:`<p>Your OTP is ${otp} </p>`,
    });
}


async function sendLink(to, link) {
    await transporter.sendMail({
        from:"Authentication",
        to,
        subject:"reset password",
        html:`<p>Reset your password</p> <a href="${link}">${link}</a>`
    });
}


module.exports = {sendOtp, sendLink};