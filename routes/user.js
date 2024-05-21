const express = require("express");
const { register, login, getMyProfile, logout, getInfoById, getAll } = require("../controllers/userController");
const { checkAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/new", register);
router.post("/login", login);

router.get("/logout", logout);

router.get("/me", checkAuth, getMyProfile);

router.get("/user/:id", getInfoById);

router.get("/users", getAll);

module.exports = router;