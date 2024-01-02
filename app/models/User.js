const db = require('../../db_config/db_config');

// function findUserById(id,callback){
//   db.query('SELECT first_name FROM users WHERE id = ?',id,(error,results)=>{
//     if (error) throw error;
//     callback(results);
//   })
// }

function findUserById(id) {
  return new Promise((resolve, reject) => {

    db.query('SELECT first_name FROM users WHERE id = ?', id, (error, results) => {
      if (error) {
        console.error('Error executing SQL query:', error);
        reject(error);
        return;
      }

      if (results.length === 0) {
        resolve(null); // Handle the case where no user is found
        return;
      }

      const firstName = results[0].first_name;
      
      resolve(firstName);
    });
  });
}

async function saveCollection(data) {
  try {
    const [results] = await db.execute('INSERT INTO collections (user_id, pokemon_id) VALUES (?, ?)', [data.userid, data.cardid]);

    // Check if any rows were affected (optional)
    if (results && 'affectedRows' in results && results.affectedRows > 0) {
      return 'Collection saved successfully';
    } else {
      return 'No rows were affected'; 
    }
  } catch (error) {
    console.error('Error executing SQL query:', error);
    throw error; // Re-throw the error to be caught by the calling function
  }
}

function allUser(callback) {
    db.query('SELECT * FROM users', (error, results) => {
      if (error) throw error;
      callback(results);
    });
}

// function allUser(callback) {
//   db.query('SELECT * FROM users', (error, results) => {
//     if (error) {
//       console.error('Error executing SQL query:', error);
//       return callback(error, null);
//     }

//     callback(null, results);
//   });
// }

function createUser(user, callback) {
    db.query('INSERT INTO users SET ?', user, (error, results) => {
      if (error) throw error;
      callback(results);
    });
}



module.exports = {
    allUser,
    createUser,
    findUserById,
    saveCollection
  };

