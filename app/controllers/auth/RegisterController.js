const db = require('../../../db_config/db_config');
const util = require('util');
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');

const query = util.promisify(db.query).bind(db);

module.exports={
    index:(req, res)=>{
      return res.render("auth/register", {errors: ''});
    },

  register: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/register', { errors: errors.mapped() });
    }
    const { name, email, password } = req.body;
    let hashedPassword = await bcrypt.hash(password, 10);
    const setData = { first_name:name, email, password: hashedPassword };

    try {
      const insertQuery = 'INSERT INTO USERS SET ?';
      await query(insertQuery, setData);
      return res.redirect('/login');
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }

  },

    isEmailExist: async (email)=>{
      db.query('SELECT email from users WHERE email = ?', [email], (err, results)=>{
        if(err) return err;
        if(results[0]){
          return true;
        }
      });
    }
}