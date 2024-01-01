const db = require('../../../db_config/db_config');
const util = require('util');
const fs = require('fs');
const path = require('path');

const query = util.promisify(db.query).bind(db);

module.exports = {
    index: async (req, res) => {
        try{ 
            const cardsQuery = 'SELECT * FROM POKEMONS';
            const cards = await query(cardsQuery);
            const success = req.flash('success')[0];
            res.render('admin/card/index', {cards, success});
         } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
        
    },

    create: async (req, res) => {
        try {
            // Fetching Data From Categories Table
            const categoriesQuery = 'SELECT * FROM CATEGORIES';
            const categories = await query(categoriesQuery);

            // Fetching Data From Sets Table
            const setsQuery = 'SELECT * FROM SETS';
            const sets = await query(setsQuery);

            res.render('admin/card/create', { categories, sets, errors:'' });

        } catch (err) {
            console.error(err);
            req.flash('error', 'Something is wrong...');
            res.redirect(500, 'admin/cards/create');
        }
    },

    store: async (req, res) => {
        const {
            name,
            rarity,
            hp,
            retreat,
            description,
            evolveFrom,
            category_id,
            set_id
        } = req.body;

        let image = null;
        if(req.file){
            image = req.file.filename;
        }       

        const cardData = {
            name,
            rarity,
            hp,
            retreat,
            description,
            evolveFrom,
            category_id,
            set_id,
            image,
        };

        try {
            const insertQuery = 'INSERT INTO POKEMONS SET ?';
            await query(insertQuery, cardData);
            req.flash('success', 'New record inserted successfully.');
            res.redirect('/admin/cards');
        } catch (err) {
            console.error(err);
            req.flash('error', 'Something is wrong...');
            res.redirect(500, '/admin/cards/create');
        }
    },

    edit: async (req, res)=>{
        let id = req.params.id;
        try {
            // Fetching Data From Categories Table
            const categoriesQuery = 'SELECT * FROM CATEGORIES';
            const categories = await query(categoriesQuery);

            // Fetching Data From Sets Table
            const setsQuery = 'SELECT * FROM SETS';
            const sets = await query(setsQuery);
           
            const cardQuery = `SELECT * FROM POKEMONS WHERE ID = ${id}`;
            const card = await query(cardQuery);
            console.log('Card',card[0]);
            const error = req.flash('error')[0];
            res.render('admin/card/edit', { categories, sets, card:card[0], error, errors:''});
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },

    update: async(req, res)=>{
        const cid = req.params.id;
        const {
            name,
            rarity,
            hp,
            retreat,
            description,
            evolveFrom,
            category_id,
            set_id
        } = req.body;
        try {
            let image = null;
            // Check if a new image is available
        if (req.file) {
            // Remove old image
            const cardQuery = `SELECT * FROM POKEMONS WHERE ID = ${cid}`;
            const cards = await query(cardQuery);
            const card = cards[0];
            if(card.image){
                const oldImagePath = `public/img/cards/${card.image}`;
                fs.unlink(oldImagePath, function(err){
                    if(err){
                        console.log("unable to delete file", err);
                    }
                })
            }
            // Upload new image
            image = req.file.filename;
        }
            const updateQuery = `
            UPDATE POKEMONS 
            SET 
                name = ?,
                rarity = ?,
                hp = ?,
                retreat = ?,
                description = ?,
                evolveFrom = ?,
                category_id = ?,
                set_id = ?,
                image = COALESCE(?, image)
            WHERE ID = ?`;

        await query(updateQuery, [name, rarity, hp, retreat, description, evolveFrom, category_id, set_id, image, cid]);
        req.flash('success', 'Card updated successfully.');           
        res.redirect('/admin/cards');
        } catch (err) {
            console.error(err);
            req.flash('error', 'Something is wrong...');
            res.redirect(500, `/admin/cards/edit/${cid}`);
        }
    },

    delete: async (req, res) => {
        const id = req.params.id;    
        try {
            const deleteQuery = `DELETE FROM POKEMONS WHERE ID = ?`;
    
            const result = await query(deleteQuery, [id]);
    
            if (result.affectedRows === 0) {
                // ID not found
                res.redirect('/admin/cards?error=Card not found');
                return;
            }
    
            res.redirect('/admin/cards?success=Card deleted successfully');
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },
}