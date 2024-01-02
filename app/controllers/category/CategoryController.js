
const db = require('../../../db_config/db_config');
const util = require('util');

const query = util.promisify(db.query).bind(db);

module.exports = {
    index: async (req, res) => {
        try{ 
            const categoriesQuery = 'SELECT * FROM CATEGORIES';
            const categories = await query(categoriesQuery);
            return res.render('admin/category/index',{categories});
         } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }        
    },

    create: async (req, res) => {
        try {
            res.render('admin/category/create', { errors:'' });

        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },

    store: async (req, res) => {
        const { name } = req.body;
        const cardData = { name };
        try {
            const insertQuery = 'INSERT INTO CATEGORIES SET ?';
            await query(insertQuery, cardData);
            res.redirect('/admin/categories');
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },

    edit: async (req, res)=>{
        let id = req.params.id;
        try {
            // Fetching Data From Categories Table
            const categoriesQuery = 'SELECT * FROM CATEGORIES WHERE ID = ?';
            const category = await query(categoriesQuery, [id]);
            res.render('admin/category/edit', { category:category[0], errors:''});
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },

    update: async(req, res)=>{
        const id = req.params.id;
        const {
            name,
        } = req.body;
        try {
            const updateQuery = `
                UPDATE CATEGORIES 
                SET 
                    NAME = ?
                WHERE ID = ?`;

        await query(updateQuery, [name, id]);
            res.redirect('/admin/categories');
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },

    delete: async (req, res) => {
        const id = req.params.id;    
        try {
            const deleteQuery = `DELETE FROM CATEGORIES WHERE ID = ?`;
    
            const result = await query(deleteQuery, [id]);
    
            if (result.affectedRows === 0) {
                // ID not found
                res.redirect('/admin/categories');
                return;
            }    
            res.redirect('/admin/categories');
        } catch (err) {
            console.error(err);
            res.redirect('/admin/categories');
            res.status(500).send('Internal Server Error');
        }
    },
}