const mongoose = require('mongoose');
const {userSchema} = require('./Schemas');
const { propertySchema } = require('./Schemas')
const { userRequestsSchema } = require('./Schemas')
const { loanRepaymentSchema } = require('./Schemas')

// require('./database_connection');

const User = mongoose.model('User', userSchema);
const Property = mongoose.model('Property', propertySchema);
const UserRequests = mongoose.model('UserRequests', userRequestsSchema);
const LoanRepayment = mongoose.model('LoanRepayment', loanRepaymentSchema);

module.exports = {
    User,
    Property,
    UserRequests,
    LoanRepayment
}