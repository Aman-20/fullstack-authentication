const express = require("express");
const router = express.Router();

const {handleLogin, handleSignup, handleLogout, verifyOtp, resendOtp, forgotPassword, resetPassword} = require("../controller/user");
const {CheckUserAuth} = require("../middleware/checkAuth");


router.get("/me", CheckUserAuth, (req, res) => {
    res.json({success:true, user:req.user});
});


router.post("/signup", handleSignup);

router.post("/login", handleLogin);

router.get("/logout", handleLogout);

router.post("/verify-otp", verifyOtp);

router.post("/resend-otp", resendOtp);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);


module.exports = router;