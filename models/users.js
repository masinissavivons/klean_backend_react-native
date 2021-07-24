const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    
});

const userModel = mongoose.model('users', userSchema)

module.exports = userModel