const db = require('../../../db_config/db_config');
const util = require('util');

const query = util.promisify(db.query).bind(db);

module.exports = {
    index: async (req, res) =>{
        try{ 
            const setsQuery = `SELECT
            sets.id,
            sets.name,
            sets.logo,
            sets.card_count,
            sets.serie_id,
            JSON_OBJECT(
                'id', series.id,
                'name', series.name
            ) AS serie
        FROM
            SETS sets
        LEFT JOIN
            SERIES series ON sets.serie_id = series.id;`;
            const sets = await query(setsQuery);
            return res.render('admin/set/index',{sets});
         } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },

    create: async (req, res) =>{
        try{ 
            const seriesQuery = 'SELECT * FROM SERIES';
            const series = await query(seriesQuery);
            return res.render('admin/set/create',  {series, errors: ''});
         } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }        
    },

    store: async (req, res) =>{
        const{id, name, serie_id, official, total} = req.body;

        // Convert id to lowercase
        const loId = id.toLowerCase();

        const setData = {id: loId, name, serie_id, card_count:JSON.stringify({'official':official, 'total':total}) };
        try {
            const insertQuery = 'INSERT INTO SETS SET ?';
            await query(insertQuery, setData);
            res.redirect('/admin/sets');
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },

    edit: async (req, res)=>{
        const id = req.params.id;
        const seriesQuery = 'SELECT * FROM SERIES';
        const series = await query(seriesQuery);

        try {
           // Fetching Data From Categories Table
           const setQuery = 'SELECT * FROM SETS WHERE ID = ?';
           const set = await query(setQuery, [id]);
           res.render('admin/set/edit', { set:set[0], series, errors:''});
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },

    update: async (req, res)=>{
        const setId = req.params.id;
        const{id, name, serie_id, official, total} = req.body;

        // Convert id to lowercase
        const loId = id.toLowerCase();

        const setData = {id: loId, name, serie_id, card_count:JSON.stringify({'official':official, 'total':total}) };

        try {
            const updateQuery = `
                UPDATE SETS 
                SET 
                    ID = ?,
                    NAME = ?,
                    SERIE_ID = ?,
                    CARD_COUNT = ?
                WHERE ID = ?`;

        await query(updateQuery, [setData.id, setData.name, setData.serie_id, setData.card_count, setId]);
            res.redirect('/admin/sets');
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },

    delete: async(req, res) => {
        const id = req.params.id;    
        try {
            const deleteQuery = `DELETE FROM SETS WHERE ID = ?`;
    
            const result = await query(deleteQuery, [id]);
    
            if (result.affectedRows === 0) {
                // ID not found
                res.redirect('/admin/sets');
                return;
            }    
            res.redirect('/admin/sets');
        } catch (err) {
            console.error(err);
            res.redirect('/admin/sets');
            res.status(500).send('Internal Server Error');
        }
    },
}
