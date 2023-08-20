const { Schema } = require('mongoose');

const userSchema = new Schema({
    account_address: String,
    name: String,
    dob: String,
    email: String,
    gender: String,
    country: String,
    dist: String,
    pc: Number,
    po: String,
    state: String,
    street: String,
    subdist: String,
    vtc: String,
});

module.exports = {
    userSchema
}