#! /usr/bin/env node

const userArgs = process.argv.slice(2);

// Models
const Item = require("./model/item");
const Category = require("./model/category");

const items = [];
const categories = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createCategory();
    await createItem();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
}

async function categoryCreate(index, name, description) {
    const category = new Category({ name: name, description: description });
    await category.save();
    categories[index] = category;
}

async function itemCreate(index, name, description, category, price, quantity) {
    const item = new Item({ name: name, description: description, category: category, price: price, quantity: quantity });
    await item.save();
    items[index] = item;
}

async function createCategory() {
    await Promise.all([
        categoryCreate(0, "Sofa", "Comfortable sofa for your living room."),
        categoryCreate(1, "Bed", "Soft bed for a relaxing sleep"),
        categoryCreate(2, "Table", "Fancy table collection")
    ]);
}

async function createItem() {
    await Promise.all([
        itemCreate(0, "Modular", "The best sofa for movie nights", [categories[0]], 1500, 2),
        itemCreate(1, "Bunk bed", "Designed to accomodate two single mattresses", [categories[1]], 2000, 1),
        itemCreate(2, "Dining Table", "A table on which meals are served in a dining room", [categories[2]], 1100, 4),
        itemCreate(3, "Loft bed", "A bunk bed that only has the top bunk with an open space underneath", [categories[1]], 1400, 3)
    ]);
}