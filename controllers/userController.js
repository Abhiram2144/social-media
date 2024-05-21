const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const  sendCookie  = require("../utils/cookie.js");


// Follow a user
const followUser = async (req, res) => {
  try {
    // Get the user ID of the user making the request
    const userId = req.user._id;

    // Get the user ID of the user to follow (assuming it's sent in the request body)
    const { userIdToFollow } = req.body;

    // Check if the user to follow exists
    const userToFollow = await User.findById(userIdToFollow);
    if (!userToFollow) {
      return res.status(404).json({ error: 'User to follow not found' });
    }

    // Check if the user is already following the user
    if (userToFollow.followers.includes(userId)) {
      return res.status(400).json({ error: 'User is already following this user' });
    }

    // Add the user's ID to the followers list of the user to follow
    userToFollow.followers.push(userId);
    await userToFollow.save();

    // Add the user to follow's ID to the following list of the current user
    const currentUser = await User.findById(userId);
    currentUser.following.push(userIdToFollow);
    await currentUser.save();

    res.status(200).json({ message: 'User followed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Find people
const findPeople = async (req, res) => {
  try {
    // Get the user ID of the user making the request
    const userId = req.user._id;

    // Find users who are not already followed by the user
    const people = await User.find({ _id: { $ne: userId, $nin: req.user.following } });

    res.status(200).json(people);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};




const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user)
    {
        return res.status(400).json({success: false, message: "Invalid Email or Password"});
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({success: false, message: "Invalid Email or Password"});

    sendCookie(user, res, `Welcome back, ${user.username}`, 200);
  } catch (error) {
    next(error);
  }
};

const register = async (req, res,next) => {
  try {
    const { username, email, password } = req.body;

    let user = await User.findOne({ email });

    if (user){
        return res.status(400).json({success: false, message: "User already exists"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({ username, email, password: hashedPassword });

    sendCookie(user, res, "Registered Successfully", 201);
  } catch (error) {
    next(error);
  }
};

const getMyProfile = (req, res) => {
  const { _id, username, email, followers, following } = req.user;
  res.status(200).json({
    success: true,
    user: { _id, username, email, followers, following },
  });
};

const logout = (req, res) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      user: req.user,
      message: "Logged out successfully",
    });
};

const getInfoById = (req,res) =>{

  const id = req.params.id;
  User.findById(id)
  .then(data => {
    if (!data) {
      res.status(404).send({ message: "Not found user with id" + id });
    } else {
      const { _id, username, email } = data;
      res.status(200).json({ success: true, user: { _id, username, email } });
    }
  })
  .catch(err => {
    res
    .status(500)
    .send({message: "Error retrieving user with id" + id});
  });

}

const getAll = (req,res) =>{
  User.find()
  .then(data => {
    const users = data.map(user => {
      const { _id, name, email } = user;
      return { _id, name, email };
    });
    res.status(200).json({ success: true, users });
  })
  .catch(err => {
    res
    .status(500)
    .send({message: err.message || "Error retrieving users"});
  });
}

module.exports = { login, register, getMyProfile, logout, getInfoById, getAll, findPeople, followUser};