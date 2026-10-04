const { User } = require("../model/user");
const { hashUserPass, verifyUserPass } = require("../service/hashPass");
const { setUser, getUser } = require("../service/jwt");

const {Otp} = require("../model/otp");
const {generateOtp, generateLink} = require("../service/generate");
const {sendOtp, sendLink} = require("../service/mailer");


//Limites Here
const OTP_EXPIRY = 10*60*1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;


async function handleSignup(req, res) {
    const { name, email, password } = req.body;

    const checkUser = await User.findOne({ email });

    if (checkUser && checkUser.isVerified) {
        return res.json({success:false, msg: "user already exist" });
    }

    const hash = await hashUserPass(password);


    if(checkUser){
        checkUser.name = name,
        checkUser.pass = hash,
        await checkUser.save();
    } else {
        await User.create({
            name,
            email,
            pass: hash,
        });
    }

    const newOtp = generateOtp();

    await Otp.findOneAndUpdate({email, purpose:"email_verify"}, {code:newOtp, expiresAt: new Date(Date.now()+OTP_EXPIRY), attempts: 0}, {upsert:true, returnDocument: 'after'});

    await sendOtp(email, newOtp);
    
    return res.json({ success: true, msg: "Otp Sent Successfully"});
};


async function verifyOtp(req, res){
    try{
    const {email, otp} = req.body;

    const record = await Otp.findOne({email, purpose:"email_verify"});
    if(!record){
        return res.json({success:false, msg:"OTP expired. Please request a new one"});
    }

    if(record.expiresAt < Date.now()){
        await Otp.deleteOne({_id: record._id});
        return res.json({success:false, msg:"OTP expired. Please request a new one"});
    }

    if(record.attempts >= MAX_ATTEMPTS){
        await Otp.deleteOne({_id: record._id});
        return res.json({success:false, msg:"Too many attempts. Please request a new OTP"});
    }

    if(record.code !== otp){
        record.attempts += 1;

        if(record.attempts >= MAX_ATTEMPTS){
            await Otp.deleteOne({_id: record._id});
            return res.json({success:false, msg:"Too many attempts. Please request a new OTP"});
        }
        
        await record.save();
        return res.json({success:false, msg:`Invalid OTP. ${MAX_ATTEMPTS - record.attempts} attempts left`});
    }

    const user = await User.updateOne({email}, {isVerified:true}, {returnDocument: 'after'});

    await Otp.deleteOne({_id: record._id});

    const token = setUser(user);
    res.cookie("uid", token, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
        secure: true, //false
        sameSite: "none", //lax
    });

    return res.json({success:true, msg:"Email verified successfully"});

    } catch(err){
        res.status(500).json({ success: false, msg: err.message });
    }

}


async function resendOtp(req, res){
    try{
    const {email} = req.body;
    const user = await User.findOne({email});

    if(!user){
        return res.json({ success: false, msg: "User not found" });
    }

    if(user.isVerified){
        return res.json({ success: false, msg: "Email already verified" });
    }

    const otp = await Otp.findOne({email, purpose:"email_verify"});
    
    if(otp && Date.now()-otp.updatedAt < RESEND_COOLDOWN_MS){
        const timeMs = RESEND_COOLDOWN_MS - (Date.now()-otp.updatedAt);
        return res.json({ success: false, msg: `Please wait ${Math.ceil(timeMs / 1000)}s before requesting again` });
    }

    const newOtp = generateOtp();

    await Otp.findOneAndUpdate({email, purpose:"email_verify"}, {code:newOtp, expiresAt: new Date(Date.now()+OTP_EXPIRY), attempts: 0}, {upsert:true, returnDocument: 'after'});

    await sendOtp(email, newOtp);

    res.json({ success: true, msg: "New OTP sent to your email" });

    } catch(err){
        res.status(500).json({ success: false, msg: err.message });
    }
}


async function handleLogin(req, res) {
    const { email, password } = req.body;

    const verifyUser = await User.findOne({ email });
    if (!verifyUser) {
        return res.json({success: false, msg: "user does not exist" });
    }

    if(!verifyUser.isVerified){
        return res.json({ success: false, msg: "Please verify your email first" });
    }

    const verifyPass = await verifyUserPass(password, verifyUser.pass);
    if (!verifyPass) {
        return res.json({ success: false, msg: "password does not match" });
    }

    const token = setUser(verifyUser);
    res.cookie("uid", token, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
        secure: true, //false
        sameSite: "none", //lax
    });

    return res.json({ success: true, msg: "Your are logged in" });
};


async function forgotPassword(req, res){
    const {email} = req.body;

    const user = await User.findOne({email});
    if(!user){
        return res.json({ success: true, msg: "User does not exist" });
    }

    const otp = await Otp.findOne({email, purpose:"pass_reset"});
    if(otp){
        const time = Date.now() - otp.updatedAt;
        if(time < RESEND_COOLDOWN_MS){
            const timeMs = RESEND_COOLDOWN_MS - time;
            return res.json({success:false, msg:`Please wait ${Math.ceil(timeMs / 1000)}s before requesting again`})
        }
    }

    const token = generateLink();
    await Otp.findOneAndUpdate({email, purpose:"pass_reset"}, {code:token, expiresAt:Date.now()+ OTP_EXPIRY, attempts:0}, {upsert:true, returnDocument: 'after'});

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}?email=${email}`;

    await sendLink(email, resetLink);

    res.json({ success: true, msg: "a reset link has been sent" });

};


async function resetPassword(req, res){
    const {email, token, newPass} = req.body;

    const record = await Otp.findOne({email});

    if(!record){
        return res.json({ success: false, msg: "Invalid or expired reset link" });
    }

    if(record.expiresAt < Date.now()){
        return res.json({ success: false, msg: "Reset link expired. Please request a new one" });
    }

    if(record.code != token){
        return res.json({ success: false, msg: "Invalid reset link" });
    }

    const hashPass = await hashUserPass(newPass);

    await User.findOneAndUpdate({email}, {pass:hashPass});

    await Otp.deleteOne({_id:record._id});

    res.json({ success: true, msg: "Password reset successful" });
}


async function handleLogout(req, res) {
    try {
        res.clearCookie("uid", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        return res.status(200).json({ success: true, message: "cookie cleared" });
    } catch (err) {
        return res.status(500).json({ success: false, message: "unbale to delete cookie" });
    }
}

module.exports = { handleLogin, handleSignup, handleLogout, verifyOtp, resendOtp, forgotPassword, resetPassword};