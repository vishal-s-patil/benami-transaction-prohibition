const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const db = require('./Database/database_connection')
userSchema = require('./Database/Schemas')

const User = mongoose.model('users', userSchema);

User.find({})
    .then((result) => {
        console.log('res', result);
        db.close();
    }).catch((err) => {
        console.log(err);
    });