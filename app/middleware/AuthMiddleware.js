const db = require('../../db_config/db_config')
const jwt = require('jsonwebtoken');
const util = require('util');
const { findUserById } = require('../models/User');
const query = util.promisify(db.query).bind(db);

const auth = async (req, res, next) => {
    if (!req.cookies.user) return res.redirect('/login')
    try {
        const decoded = jwt.verify(req.cookies.user, process.env.JWT_SECRET);
        const userQuery = `SELECT * FROM USERS WHERE ID = ?`;
        const users = await query(userQuery, [decoded.id]);
        const user = users[0];
        if (!user) {
            res.redirect(404, '/login');
            return;
        }
        // Check if the user's role is 1
        if (user.role !== 1) {
            res.redirect('/');
            return;
        }
        res.user = user;
        res.locals.user = user;
        next();
    } catch (err) {
        if (err) {
            console.log(err);
            return res.redirect('/login');
        }
    }
}

const userAuth = async (req, res, next) => {
    //if (!req.cookies.user) return res.redirect('/login');
    try {
        const decoded = jwt.verify(req.cookies.user, process.env.JWT_SECRET);
        const userQuery = `SELECT * FROM USERS WHERE ID = ?`;
        const users = await query(userQuery, [decoded.id]);
        const user = users[0];
        if (!user) {
            res.redirect(404, '/login');
            return;
        }
        res.user = user;
        res.locals.user = user;
        next();
    } catch (err) {
        if (err) {
            console.log(err);
            return res.redirect('/login');
        }
    }
}

const isSignOut = async(req, res, next) => {
    try {
        if(req.cookies.user){
            const decoded = jwt.verify(req.cookies.user, process.env.JWT_SECRET);
            const userQuery = `SELECT * FROM USERS WHERE ID = ?`;
                const users = await query(userQuery, [decoded.id]);
                const user = users[0];
                if(!user){
                    res.redirect(404, '/');
                    return;
                }
            res.redirect('/'); 
            return;
        }
        next();
    } catch (err) {
        if (err){
            console.log(err);
            return res.redirect('/login');
        } 
    }
}


module.exports = {auth, userAuth, isSignOut};