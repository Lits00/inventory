const Item = require('../model/item');
const Category = require('../model/category');
const { body, validationResult } = require('express-validator');

const asyncHandler = require('express-async-handler');

exports.index = asyncHandler(async (req, res, next) => {
    const [ numItems, numCategories] = await Promise.all([
        Item.countDocuments({}).exec(),
        Category.countDocuments({}).exec()
    ]);
    res.render("index", {
        title: "Furnitures",
        item_count: numItems,
        category_count: numCategories,
    });
    // res.render('inventory', { title: "Home Inventory App" })
})

// Display list of items
exports.item_list = asyncHandler(async (req, res, next) => {
    const allItems = await Item.find({}).exec()
    res.render("items", {
        title: "Item List",
        items: allItems,
    })
});

exports.item_detail = asyncHandler(async (req, res, next) => {
    // res.send(`Not Implemented: Item detail: ${req.params.id}`);
    const item = await Item.findById(req.params.id)
    .populate("category")
    .exec()
    
    if(item === null){
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
    }
    res.render("itemDetail", { title: "Item Detail", item: item });
});

exports.item_create_get = asyncHandler(async (req, res, next) => {
    // res.send("Not Implemented: Item create Get");
    const allCategories = await Category.find().sort({ name: 1 }).exec();

    res.render("item_form", { 
        title: "Create Item", 
        categories: allCategories,
        item: undefined,
        errors: [],
    });
});

exports.item_create_post = [
    (req, res, next) => {
        // res.send("Not Implemented: Item create Post");
        if( !Array.isArray(req.body.category)) {
            req.body.category =
            typeof req.body.category === "undefined" ? [] : [req.body.category];
        }
        next();
    },

    // validate and sanitize fields
    body("name", "Item name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body("description", "Item description should not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body("category.*", "Category should not be empty.")
    .escape(),

    asyncHandler(async ( req, res, next ) => {
        const errors = validationResult(req);

        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            quantity: req.body.quantity,
        });

        if (!errors.isEmpty()) {
            // Re-render form with sanitized values/error messages if there are errors.
            // Get all categories for form.
            const allCategories = await Category.find().sort({ name: 1 }).exec();
            
            for (const category of allCategories) {
                if(item.category.includes(category._id)) {
                    category.checked = "true"; // Mark our selected category as checked.
                }
            }
            res.render("item_form", {
                title: "Create Item",
                categories: allCategories,
                item: item,
                errors: errors.array(),
            });
        } else {
            await item.save();
            res.redirect(item.url);
        }
    }),
];

exports.item_delete_get= asyncHandler(async (req, res, next) => {
    const item = await Item.findById(req.params.id).exec();

    if(item === null) {
        res.redirect("/inventory/items");
    }

    res.render("item_delete", {
        title: "Delete Item",
        item: item,
    });
});

exports.item_delete_post = asyncHandler(async (req, res, next) => {
    await Item.findByIdAndDelete(req.params.id).exec();
    res.redirect("/inventory/items");
});

exports.item_update_get = asyncHandler(async (req, res, next) => {
    const [item, allCategories] = await Promise.all([
        Item.findById(req.params.id).populate("category").exec(),
        Category.find().sort({ name: 1 }).exec(),
    ]);

    if(item === null) {
        const err = new Error("Item not found");
        err.status = 404;
        return next(err)
    }

    res.render("item_form", {
        title: "Update Item",
        categories: allCategories,
        item: item,
        errors: [],
    })
});

exports.item_update_post = [
    (req, res, next) => {
        if(!Array.isArray(req.body.category)) {
            req.body.category =
            typeof req.body.category === "undefined" ? [] : [req.body.category];
        }
        next();
    },

    body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body("category.*").escape(),
    body("price", "Price must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body("quantity", "Quantity must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req)

        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            category: typeof req.body.category === "undefined" ? [] : req.body.category,
            price: req.body.price,
            quantity: req.body.quantity,
            _id: req.params.id,
        })

        if(!errors.isEmpty()) {
            const allCategories = await Category.find().sort({ name: 1 }).exec();

            res.render("item_form", {
                title: "Update Item",
                categories: allCategories,
                item: item,
                errors: errors.array(),
            })
            return;
        } else {
            const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
            res.redirect(updatedItem.url);
        }
    }),
];