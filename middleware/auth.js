
const User = require("../models/User");
const jwt = require("jsonwebtoken");
// when user account is created we create a token with this secret key so we verify it now
const secret_key = "pingu";

const checkAuth = async(req,res,next)=>{
    // get the token from the stored cookies
    const {token}  = req.cookies;
    // if token is not present
    if(!token)
    {
        return res.status(401).json({success : false , message:"Unauthorized Access"});
    }
    // if token is present
    // verify the token
    const decoded = jwt.verify(token,secret_key);
    // if token is not verified
    if(!decoded)
    {
        return res.status(401).json({success : false , message:"Unauthorized Access"});
    }
    // if token is verified
    // find the user with the id from the token
    const user = await User.findById(decoded._id);
    // if user is not found
    if(!user)
    {
        return res.status(401).json({success : false , message:"Unauthorized Access"});
    }
    // if user is found
    // store the user in the request object
    req.user = user;
    // if we did not use next(), then the flow will be stopped in the middleware and do not continue.
    next();
}

module.exports = {checkAuth};