const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const schema = new Schema({
    tip: { type: mongoose.Schema.Types.ObjectId, ref: 'Tip', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Favorite_Tip', schema);