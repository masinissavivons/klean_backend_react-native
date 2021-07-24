var mongoose = require('mongoose');

const user = 'admin';
const mdp = 'admin';
const bddName = 'kleansBdd';

const options = {
  connectTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedTopology : true
}

const connectionString =  `mongodb+srv://${user}:${mdp}@cluster0.wyxtx.mongodb.net/${bddName}?retryWrites=true&w=majority`;
// mongodb+srv://admin:admin@cluster0.wyxtx.mongodb.net/kleansBdd?retryWrites=true&w=majority

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