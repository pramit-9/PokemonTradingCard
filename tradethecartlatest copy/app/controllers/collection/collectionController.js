const db = require('../../../db_config/db_config');
const util = require('util');

const query = util.promisify(db.query).bind(db);

module.exports = {
    store: async (req, res)=>{
        const { userid, cardid } = req.body;
        const collectionData = { user_id:userid, pokemon_id:cardid }
        console.log(collectionData);
        try {
            const insertQuery = 'INSERT INTO COLLECTIONS SET ?';
            await query(insertQuery, collectionData);
            console.log(insertQuery);
            // res.redirect(`/card/${cardid}`);
            res.json({ success: true, message: 'Card added to collection' });
        } catch (err) {
          res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    showCollectionById:async(req,res)=>{
        const userid = req.params.userid;
        console.log("params is",userid)
        try{
            const collectionData = `
            SELECT collections.pokemon_id, pokemons.name, pokemons.image, users.first_name,users.id
            FROM collections
            INNER JOIN pokemons ON collections.pokemon_id = pokemons.id
            INNER JOIN users ON collections.user_id = users.id
            WHERE collections.user_id = ?;
          `;
        //   await query(query, userid);
        const results = await query(collectionData, [userid]);
        // console.log("id user",results)
        if (results.length > 0) {
            res.json({
              message: "success",
              pokemons: results
            })
          }
          else {
            res.json({
              message: "not found",
              pokemons: []
            })
          }

        }catch(err){
            console.error('Error:', err);
            res.status(500).send('Internal Server Error');

        }
       

    },
    // showNotInCollectionById:async(req,res)=>{
    //     const userid = req.params.userid;
    //     console.log("params not is",userid)
    // }
    showNotInCollectionById: async (req, res) => {
      const userid = req.params.userid;
      console.log("params is", userid);
      try {
        const notInCollectionQuery = `
          SELECT pokemons.id as pokemon_id, pokemons.name, pokemons.image, users.first_name, users.id
          FROM pokemons
          LEFT JOIN collections ON collections.pokemon_id = pokemons.id AND collections.user_id = ?
          LEFT JOIN users ON collections.user_id = users.id
          WHERE collections.user_id IS NULL;
        `;
        const results = await query(notInCollectionQuery, [userid]);
    
        if (results.length > 0) {
          res.json({
            message: "success",
            pokemons: results,
          });
        } else {
          res.json({
            message: "not found",
            pokemons: [],
          });
        }
      } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
      }
    },
    sortOrder: async (req, res) => {
      const { sortOrder } = req.params;
      console.log("od",sortOrder)
    
      try {
        let sortingQuery;
    
        switch (sortOrder) {
          case 'asc':
            sortingQuery = 'ORDER BY pokemons.name ASC';
            break;
          case 'des':
            sortingQuery = 'ORDER BY pokemons.name DESC';
            break;
          default:
            sortingQuery = '';
        }
    
        const sortCardsQuery = `
        SELECT *
        FROM pokemons
        ${sortingQuery};
      `;
     
    
        const results = await query(sortCardsQuery);

    
        if (results.length > 0) {
          
          res.json({
            message: "success",
            pokemons: results,
          });
        } else {
          res.json({
            message: "not found",
            pokemons: [],
          });
        }
      } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
      }
    },
    
    
    sortOrderFrom: async (req, res) => {
      const { sortOrderfrom } = req.params;
      console.log("from",sortOrderfrom)
    
      try {
        let sortingQuery;
    
        switch (sortOrderfrom) {
          case 'old':
            sortingQuery = 'ORDER BY pokemons.created_At ASC';
            break;
          case 'new':
            sortingQuery = 'ORDER BY pokemons.created_At DESC';
            break;
          default:
            sortingQuery = '';
        }
    
        const sortCardsQuery = `
        SELECT *
        FROM pokemons
        ${sortingQuery};
      `;
      console.log(sortCardsQuery)
    
        const results = await query(sortCardsQuery);

    
        if (results.length > 0) {
          
          res.json({
            message: "success",
            pokemons: results,
          });
        } else {
          res.json({
            message: "not found",
            pokemons: [],
          });
        }
      } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
      }
    },

    sortOrderFromSet:async (req, res) => {

      const { sortSet } = req.params;
      console.log("from",sortSet)
      const pokemonsData = await query('SELECT * FROM pokemons WHERE set_id = ?', [sortSet]);
      // console.log(pokemonsData)
      if (pokemonsData.length > 0) {
        res.json({
          message: "success",
          pokemons: pokemonsData,
        });
      }
      else {
        res.json({
          message: "not found",
          pokemons: [],
        });
      }
    }
    
}