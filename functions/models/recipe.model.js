const mongoose = require('mongoose');
var Schema = mongoose.Schema

const direction = new Schema({
    title: { type: String},
    steps: { type: [String] },
}, { _id : false })

const ingredient = new Schema({
    title: { type: String},
    ingredients: { type: [String] },
}, { _id : false })

const schema = new Schema({
    // id: { type: String },
    name: { type: String, required: true },
    description: { type: String },
    ingredients: {type: [ingredient] },
    directions: { type: [direction] },
    notes: { type: String },
    tags: {type: [String] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    imgUrl: { type: String }
});

module.exports = mongoose.model('Recipe', schema);