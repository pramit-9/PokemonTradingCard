const db = require('../../db_config/db_config');
const util = require('util');
const query = util.promisify(db.query).bind(db);


module.exports = {
    index: async (req, res)=>{
        try {
            const userQuery = 'SELECT COUNT(*) AS USERCOUNT FROM USERS';
            const userResult = await query(userQuery);
            const userCount = userResult[0];
            
            const cardQuery = 'SELECT COUNT(*) AS CARDCOUNT FROM POKEMONS';
            const cardResult = await query(cardQuery);
            const cardCount = cardResult[0];
            
            res.render('admin/dashboard', {userCount, cardCount});

        } catch (error) {
            
        }
    }
}