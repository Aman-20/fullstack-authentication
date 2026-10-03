const {getUser} = require("../service/jwt");

async function CheckUserAuth(req, res, next){
    const token = req.cookies.uid;
    if(!token){
        return res.json({success:false, msg:"no token provided"});
    }

    const verifyToken = getUser(token);
    if(!verifyToken){
        return res.json({success:false, msg:"token expired"});
    }

    req.user = verifyToken;
    return next();
}

module.exports = {CheckUserAuth};