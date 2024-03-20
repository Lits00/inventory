/* 
Note: controllers are simply the call-back functions called by the routes modules which is basically the one responsible for data processing or querying from the database etc. 
*/
const Category = require('../model/category');
const Item = require('../model/item');
const { body, validationResult } = require('express-validator'); // used to perform data validation and sanitization

/* 
installed express-async-handler middleware 
express-async-handler simplifies the process by allowing you to write async route handlers without worrying about catching errors explicitly. It wraps your async route handlers and automatically catches any errors, passing them to Express's error handling middleware.
*/
const asyncHandler = require('express-async-handler');

// Display list of category
exports.category_list = asyncHandler(async (req, res, next) => {
    const allCategories = await Category.find({}).exec()
    res.render("categories", {
        title: "Category List",
        categories: allCategories,
    })
});

exports.category_detail = asyncHandler(async (req, res, next) => {
    const [ category, itemsInCategory ] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id }, "name").exec()
    ])
    
    if(category === null){
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
    }

    res.render("categoryDetail", { 
        title: "Category Detail", 
        category: category,
        items: itemsInCategory
     });
});

exports.category_create_get = asyncHandler(async (req, res, next) => {
    res.render("category_form", { title: "Create Category", errors: [] });
});

// Passed an array of middleware functions to the router function where each method is called in order, in this case the body() and asyncHandler() middleware functions
exports.category_create_post = [
    // validation and sanitization of the name field
    body("name", "Category name must contain at least 3 characters")
    .trim() // this method removes any trailing/leading whitespace
    .isLength({ min: 3 }) // checks if the name field is not empty
    .escape(), // escape method removes any dangerous HTML characters

    // Processing request after validation and sanitization
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request
        const errors = validationResult(req);

        // Create a category object with escaped and trimmed data.
        const category = new Category({ name: req.body.name });

        if(!errors.isEmpty()) {
            // re-renders the form with sanitized values/error messages if there are errors
            res.render("category_form", {
                title: "Create Category",
                category: category,
                errors: errors.array(),
            });
            return
        } else {
            // if data from form is valid
            // check if category with the same name already exists.
            const categoryExists = await Category.findOne({ name: req.body.name })
            .collation({ locale: "en", strength: 2 }) // this ignores letter case and accents when searching an object
            .exec();

            if(categoryExists) {
                res.redirect(categoryExists.url)
            } else {
                await category.save();
                res.redirect(category.url);
            }
        }
    })
];

exports.category_delete_get= asyncHandler(async (req, res, next) => {
    const [category, allItemsInCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id }, "name description").exec()
    ]);

    if( category === null ) {
        res.redirect("/inventory/categories");
    }

    res.render("category_delete", {
        title: "Delete Category",
        category: category,
        category_items: allItemsInCategory,
    })
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
    const [category, allItemsInCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id }, "name descriptions").exec(),
    ]);

    if(allItemsInCategory.length > 0){
        res.render("category_delete", {
            title: "Delete Category",
            category: category,
            category_items: allItemsInCategory,
        });
        return
    } else {
        await Category.findByIdAndDelete(req.body.categoryid)
        res.redirect("/inventory/categories")
    }
});

exports.category_update_get = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id).exec();

    if(category === null) {
        const err = new Error("Category not found.");
        err.status = 404;
        return next(err);
    }

    res.render("category_form", {
        title: "Update Category",
        category: category,
        errors: [],
    });
});

exports.category_update_post = [
    body("name", "Category name must not be empty.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
    body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 3 })
    .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const category = new Category({
            name: req.body.name,
            description: req.body.description,
            _id: req.params.id, // when updating an object the _id must be attached in order to avoid creating a new instance of the object.
        });
        
        if(!errors.isEmpty()) {
            res.render("category_form", {
                title: "Update Category",
                category: category,
                errors: errors.array(),
            });
            return;
        } else {
            const updatedCategory = await Category.findByIdAndUpdate(req.params.id, category, {});
            res.redirect(updatedCategory.url);
        }
    })
];