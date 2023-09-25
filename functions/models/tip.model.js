const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Tip', schema);