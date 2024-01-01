const express = require('express');
const authMiddleware = require('../app/middleware/AuthMiddleware');
const { check } = require('express-validator');

// Controllers
const RegisterController = require('../app/controllers/auth/RegisterController');
const LoginController = require('../app/controllers/auth/LoginController');
const UserController = require('../app/controllers/auth/UserController');
const multer = require('multer');

const auth = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        return cb(null, "./public/img");
    },
    
    filename:(req,file,cb)=>{
        return cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage
}).single('profile_photo_path');

auth.get("/register", authMiddleware.isSignOut, RegisterController.index);

auth.post("/register", [
    check('name').notEmpty().withMessage('Name is required.'),
    check('email').notEmpty().withMessage('Email is required.'),
    check('email').isEmail().withMessage('Invalid email address.'),
    check('email').isEmail().custom((email) => {
        return RegisterController.isEmailExist(email).then((status) => {
            if (status) {
                return Promise.reject("Email already exist!");
            }
        }).catch((err) => {
            return Promise.reject(err);
        });
    }),
    check('password').notEmpty().withMessage('Password is required.'),
    check('password').isLength({min:8}).withMessage('Pssword must be atleast 8 characters long.'),
    check('confirm_password').custom((value, {req})=>{
        if(value !== req.body.password){
            return Promise.reject("Password do not matched.");
        }
        return true;
    }),

], RegisterController.register);

auth.get("/login", authMiddleware.isSignOut, LoginController.index);

auth.post("/login", [
    check('email').notEmpty().withMessage('Email is required.'),
    check('email').isEmail().withMessage('Invalid email address.'),
    check('password').notEmpty().withMessage('Password is required.'),
], LoginController.login);

auth.get("/admin/profile/:id", authMiddleware.auth, UserController.profile);
auth.post("/admin/profile/:id", upload, authMiddleware.auth, UserController.updateProfile);

auth.get("/admin/settings/:id", authMiddleware.auth, UserController.settings);
auth.post("/admin/settings/:id", authMiddleware.auth, UserController.updateSetting);

auth.get("/logout", authMiddleware.auth, UserController.logout);

module.exports = auth;