const db = require('../../../db_config/db_config');
const bcrypt = require('bcrypt');
const util = require('util');
const {validationResult} = require('express-validator');
const flash = require('express-flash');
const path = require('path');
const fs = require('fs');

const query = util.promisify(db.query).bind(db);

module.exports = {
    profile: async (req, res) => {
        const uid = req.params.id;
        try {
            // Fetching Data From Categories Table
            const userQuery = `SELECT * FROM USERS WHERE ID = ${uid}`;
            const users = await query(userQuery);
            const user = users[0];
            const success = req.flash('success')[0];
            const error = req.flash('success')[0];
            res.render('auth/profile', { user, success, error, errors: '' });
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },

    updateProfile: async (req, res) => {
        const uid = req.params.id;
        const { first_name, last_name, gender,address, country, dob} = req.body;
        try {
            let profile_photo_path = null;
        // Check if a new image is available
        if (req.file) {
            // Remove old image
            const userQuery = `SELECT * FROM USERS WHERE ID = ${uid}`;
            const users = await query(userQuery);
            const user = users[0];
            if(user.profile_photo_path !== null){
                const oldImagePath =  (`public/img/${user.profile_photo_path}`);

        if(user.profile_photo_path){
            fs.unlink(oldImagePath, function(err){
                if(err){
                    console.log("unavailable", err)
                }
            })
        }           }
            
            // Upload new image
            profile_photo_path = req.file.filename;
        }
         
            const updateQuery = `
            UPDATE USERS 
            SET 
                first_name = ?,
                last_name = ?,
                gender = ?,
                address = ?,
                country = ?,
                dob = ?,
                profile_photo_path = COALESCE(?, profile_photo_path)
                WHERE ID = ?`;

            await query(updateQuery, [
                first_name,
                last_name,
                gender,
                address,
                country,
                dob,
                profile_photo_path, uid]);

            req.flash('success', 'Profile updated successfully.');
            res.redirect(`/admin/profile/${uid}`);
        } catch (err) {
            console.error(err);
            req.flash('error', 'Something is wrong...');
            res.redirect(500, `/admin/profile/${uid}`);
        }
    },

    settings: async (req, res) => {
        const uid = req.params.id;
        try {
            // Fetching Data From Categories Table
            const userQuery = `SELECT * FROM USERS WHERE ID = ${uid}`;
            const users = await query(userQuery);
            const user = users[0];
            const success = req.flash('success')[0];
            res.render('auth/settings', { user, success, errors: '' });
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },

    updateSetting: async (req, res) => {
        const errors = validationResult(req);
        const uid = req.params.id;
        const { email, current_password, password } = req.body;

        const userQuery = `SELECT * FROM USERS WHERE ID = ${uid}`;
        const users = await query(userQuery);
        const user = users[0];

        const validPassword = await bcrypt.compare(current_password, user.password);
        if (!validPassword) {
            res.render(`auth/settings`, {user, success:'', errors:{current_password: {msg:'Current password is incorrect.'}} });
            return;
        }
        let hashedPassword = await bcrypt.hash(password, 10);
        const userData = {email, password:hashedPassword};
        try {
            const updateQuery = `
            UPDATE USERS 
            SET 
                email = ?,
                password = ?
            WHERE ID = ?`;

            await query(updateQuery, [userData.email, userData.password, uid]);
            req.flash('success', 'Password updated successfully')
            res.redirect(`/admin/settings/${uid}`);
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },

    logout: async (req, res) => {
        res.clearCookie('user');
                res.redirect('/');
       
        
    },
}