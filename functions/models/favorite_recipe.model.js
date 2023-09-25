const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const schema = new Schema({
    recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Favorite_Recipe', schema);