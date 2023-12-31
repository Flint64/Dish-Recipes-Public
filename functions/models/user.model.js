const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const schema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true }
});

module.exports = mongoose.model('User', schema);