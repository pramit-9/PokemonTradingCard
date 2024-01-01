const { findUserById } = require('../../models/User');
const jwt = require('jsonwebtoken');
const db = require('../../../db_config/db_config');
const util = require('util');

const query = util.promisify(db.query).bind(db);
module.exports = {
    index: async (req, res)=>{
        const token = req.cookies.user;
        const loggedIn = token !== undefined;
        let username = "";
        let userid;
        if (loggedIn) {
            try {
              // Decode the JWT to get user info
              const decode = jwt.verify(token, process.env.JWT_SECRET);
        
              // Use Promise.all to await multiple asynchronous operations
              username = await findUserById(decode.id);
              userid = decode.id;
              try{
                const collectionData = `
                SELECT collections.pokemon_id, pokemons.name, pokemons.image, users.first_name,users.id
                FROM collections
                INNER JOIN pokemons ON collections.pokemon_id = pokemons.id
                INNER JOIN users ON collections.user_id = users.id
                WHERE collections.user_id = ?;
              `;
            //   await query(query, userid);
            const pokemons = await query(collectionData, [userid]);
            res.render("user/dashboard", { loggedIn, username,userid,pokemons });
            // console.log("id user",results)
            // if (results.length > 0) {
            //     res.json({
            //       message: "success",
            //       pokemons: results
            //     })
            //   }
            //   else {
            //     res.json({
            //       message: "not found",
            //       pokemons: []
            //     })
            //   }

              }catch(err){
                console.error('Error:', err);
                res.status(500).send('Internal Server Error');
              }
              
            } catch (err) {
              console.log("Error in decoding JWT", err);
            }
          }
       
       
    },
    delete_from_collection:async (req, res)=>{
      const { pokemonid } = req.params;
      const token = req.cookies.user;
      const loggedIn = token !== undefined;
console.log(loggedIn,pokemonid)
let userid;

      if(loggedIn && pokemonid){
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        userid = decode.id;
        try {
          // Assuming 'collections' is the table name
          const deleteQuery = 'DELETE FROM collections WHERE pokemon_id = ? AND user_id = ?';
          
          // Execute the delete query
          await query(deleteQuery, [pokemonid, userid]);
      
          res.json({ success: true, message: 'Record deleted successfully' });
        } catch (error) {
          console.error('Error:', error);
          res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
      }
      else{
        return;
      }
    }
}
