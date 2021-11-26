require('dotenv').config()
var mongoose = require('mongoose');

const options = {
  connectTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedTopology : true
}

const connectionString = process.env.DB_CONNECTION


mongoose.connect(
    connectionString,
    options,        
    function(err) {
      if (!err) {
        console.log('Connection à la Base de données est OK');
      } else {
        console.log(err);
      }
      
    } 
);

module.exports = mongoose