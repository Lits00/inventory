const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: {type: String, 
        required: [true, "Item name is required"],
        maxLength: 100
    },
    description: {
        type: String, 
        required: true,
        maxLength: 100
    },
    category: [{
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    }],
    price: {
        type: Number,
        min: [1, "Price shouldn't be negative"],
        required: true
    },
    quantity: {
        type: Number,
        default: 0,
        min: [0, "Value can't be negative"],
        max: 99,
    },
})

//this virtual url returns the absolute URL required to get a particular instance of the model.
ItemSchema.virtual("url").get(function () {
    return `/inventory/item/${this.id}`;
});

module.exports = mongoose.model('Item', ItemSchema)