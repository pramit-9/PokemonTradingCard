const jwt = require('jsonwebtoken');
const util = require('util');
const connection = require("../../../db_config/db_config");
const { findUserById } = require('../../models/User');
const query1 = util.promisify(connection.query).bind(connection);


module.exports = {
  index: async (req, res) => {
    try {
      // Use a SQL query to fetch Pokémon data from your database
      const query = "SELECT * FROM pokemons";
  
      connection.query(query, async (err, rows) => {
        if (err) {
          console.error("Error fetching Pokémon data:", err);
          return res.status(500).send("Internal Server Error");
        }
  
        const token = req.cookies.user;
        const loggedIn = token !== undefined;
        let username = "";
        let user_id;
    
  
        if (loggedIn) {
          try {
            // Decode the Jwt to get user info
            const decode = jwt.verify(token, process.env.JWT_SECRET);
           
  
            // Use Promise.all to await multiple asynchronous operations
            user_id = decode.id
            username = await findUserById(decode.id);
            //get set data
        
            
          } catch (err) {
            console.log("error in decoding JWT", err);
          }
        }
      const setsData = await query1('SELECT id, name FROM sets');
        res.render("frontin/index", { pokemons: rows, loggedIn, username,user_id ,setsData});
      });
    } catch (error) {
      console.error("Error in index route:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  
  searchDataByInput: (req, res) => {

console.log("res",req.params.userid)
   
    const searchTerm = req.body.searchTerm.toLowerCase();
    const query = "SELECT * FROM pokemons WHERE LOWER(name) LIKE ?";
    const searchPattern = `%${searchTerm}%`;
    connection.query(query, [searchPattern], (err, rows) => {
     // console.log("data", rows)

      if (err) {
        console.error("Error fetching Pokémon data:", err);
        return res.status(500).send("Internal Server Error");
      }

      if (rows.length > 0) {
        res.json({
          message: "success",
          pokemons: rows
        })
      }
      else {
        res.json({
          message: "not found",
          pokemons: []
        })
      }
    });


  },

  single: async (req, res) => {
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
      } catch (err) {
        console.log("Error in decoding JWT", err);
      }
    }
  
    const pokemonId = req.params.id;
  
    // Use a SQL query to fetch details for a specific Pokemon including its weaknesses
    const query = `
      SELECT
        p.*,
        w.id AS weakness_id,
        w.type AS weakness_type,
        c.id AS collection_id
      FROM
        pokemons p
      LEFT JOIN
        weaknesses w ON p.id = w.pokemon_id
      LEFT JOIN
        collections c ON p.id = c.pokemon_id AND c.user_id = ?
      WHERE
        p.id = ?;
    `;
  
    connection.query(query, [userid, pokemonId], (err, rows) => {
      if (err) {
        console.error("Error fetching Pokémon details:", err);
        return res.status(500).send("Internal Server Error");
      }
  
      const pokemon = rows[0];
      const isInCollection = pokemon.collection_id !== null;
  
      res.render("frontin/card_detail", {
        pokemon: pokemon,
        loggedIn,
        username,
        userid,
        isInCollection,
      });
    });
  },
  

};


