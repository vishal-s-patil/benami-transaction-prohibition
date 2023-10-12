const mongoose = require('mongoose');
const {userSchema} = require('./Schemas');
const { propertySchema } = require('./Schemas')

require('./database_connection');

const User = mongoose.model('User', userSchema);
const Property = mongoose.model('Property', propertySchema);

module.exports = {
    User,
    Property
}