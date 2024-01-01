const db = require('../../../db_config/db_config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const util = require('util');
const query = util.promisify(db.query).bind(db);

module.exports = {
    index: (req, res) => {
        const errmsg = req.flash('err_msg')[0];
        return res.render('auth/login', { errors: '', error:errmsg });
    },

    login: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('auth/login', { errors: errors.mapped(), error: null });
            return;
        }
        const { email, password } = req.body;
        try {
            const userQuery = `SELECT * FROM USERS WHERE EMAIL = ?`;
            const users = await query(userQuery, [email]);
            const user = users[0];

            if (!user) {
                req.flash('err_msg', 'Invalid Email/Password.Please be sure and try again.');
                res.redirect(`/login `);
                return;
            }

            if (user.role == 1) {
                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) {
                    req.flash('err_msg', 'Invalid Email/Password.Please be sure and try again.');
                    res.redirect(`/login`);
                    return;
                }

                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES,
                });

                const cookieOptions = {
                    expiresIn: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                    httpOnly: true,
                }

                res.cookie("user", token, cookieOptions);
                res.redirect('/admin/dashboard');
                return;
            }
            if (user.role == 0) {
                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) {
                    req.flash('err_msg', 'Invalid Email/Password.Please be sure and try again.');
                    res.redirect(`/login`);
                    return;
                }

                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES,
                });

                const cookieOptions = {
                    expiresIn: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                    httpOnly: true,
                }

                res.cookie("user", token, cookieOptions);
                res.redirect('/user/dashboard');
                return;
            }

        } catch (err) {
            console.error(err);
            req.flash('err_msg', 'Invalid Email/Password.Please be sure and try again.');
            res.redirect(500, 'auth/login');
        }
    },

}