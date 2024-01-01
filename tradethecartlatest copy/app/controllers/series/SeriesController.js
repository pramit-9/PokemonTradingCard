
const db = require('../../../db_config/db_config');
const util = require('util');

const query = util.promisify(db.query).bind(db);

module.exports = {
    index: async (req, res) => {
        try {
            // Fetch series data
            const seriesQuery = 'SELECT * FROM SERIES';
            const series = await query(seriesQuery);
    
            // Fetch sets data for each series
            const setsQuery = 'SELECT * FROM SETS';
            const sets = await query(setsQuery);
    
            // Map sets to series based on serie_id
            const seriesWithSets = series.map(serie => {
                const serieSets = sets
                    .filter(set => set.serie_id === serie.id)
                    .map(set => ({
                        id: set.id,
                        logo: set.logo,
                        name: set.name,
                        // Parse card_count string to object
                        cardCount: JSON.parse(set.card_count)
                    }));
    
                return {
                    id: serie.id,
                    logo: serie.logo,
                    name: serie.name,
                    sets: serieSets
                };
            });
    
            console.log(JSON.stringify(seriesWithSets, null, 2)); // Log the formatted data
            return res.render('admin/series/index', { series: seriesWithSets });
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },

    create: async (req, res) => {
        return res.render('admin/series/create',{errors:''});
    },

    store: async (req, res) => {
        const { id, name, logo } = req.body;
        const loId = id.toLowerCase();
        const serieData = { id:loId, name, logo };
        try {
            const insertQuery = 'INSERT INTO SERIES SET ?';
            await query(insertQuery, serieData);
            res.redirect('/admin/series');
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },

    edit: async (req, res)=>{
        let id = req.params.id;
        try {
            // Fetching Data From series Table
            const seriesQuery = 'SELECT * FROM SERIES WHERE ID = ?';
            const series = await query(seriesQuery, [id]);
            res.render('admin/series/edit', { serie:series[0], errors:''});
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },

    update: async(req, res)=>{
        const serieId = req.params.id;
        const { id, name, logo } = req.body;
        const loId = id.toLowerCase();
        const serieData = { id:loId, name, logo };
      
        try {
            const updateQuery = `
                UPDATE SERIES 
                SET 
                    ID = ?,
                    NAME = ?,
                    LOGO = ?
                WHERE ID = ?`;

        await query(updateQuery, [serieData.id, serieData.name, serieData.logo, serieId]);
            res.redirect('/admin/series');
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },

    delete: async (req, res) => {
        const id = req.params.id;    
        try {
            const deleteQuery = `DELETE FROM SERIES WHERE ID = ?`;
    
            const result = await query(deleteQuery, [id]);
    
            if (result.affectedRows === 0) {
                // ID not found
                res.redirect('/admin/series');
                return;
            }    
            res.redirect('/admin/series');
        } catch (err) {
            console.error(err);
            res.redirect('/admin/series');
            res.status(500).send('Internal Server Error');
        }
    },
}