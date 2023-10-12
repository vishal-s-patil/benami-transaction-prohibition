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

const propertySchema = new Schema({
    nft_id: Number,
    owner: String,
    price: Number,
    emi: Number,
    addr: String,
    type: String,
    sqft: Number,
    status: String,
    bed_rooms: String,
    bath_rooms: String,
    image: String,
    metadata: String
});

module.exports = {
    userSchema,
    propertySchema
}