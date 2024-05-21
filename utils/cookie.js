// this is to send a cookie when a user signs up or logs in
const jwt = require("jsonwebtoken");

const sendCookie = (user,res,message,status = 200)=>{
  // create a secret key
  const secret = "pingu";
  // create a token with the secret key
  const token = jwt.sign({_id : user._id},secret);

  // send the token as a cookie
  res.cookie("token",token,{
    httpOnly:true,
    sameSite:true,
    maxAge: 15*60*1000, // 15 minutes
  }).json({success: true, message:message});
}

module.exports = sendCookie;