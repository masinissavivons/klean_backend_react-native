var mongoose = require('mongoose');

const user = 'Me';
const mdp = 'codecode';
const bddName = 'klean';

const options = {
  connectTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedTopology : true
}

const connectionString = `mongodb+srv://${user}:${mdp}@mymovizapp.h9ifw.mongodb.net/${bddName}?retryWrites=true&w=majority`

// `mongodb+srv://${user}:${mdp}@cluster0.wyxtx.mongodb.net/${bddName}?retryWrites=true&w=majority`;


mongoose.connect(
    connectionString,
    options,        
    function(err) {
      if (!err) {
        console.log('Connection à la Base de données : ' + bddName + ' est OK');
      } else {
        console.log(err);
      }
      
    } 
);

module.exports = mongoose