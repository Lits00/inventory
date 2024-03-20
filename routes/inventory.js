const express = require("express");
const router = express.Router();

// Controllers //
const category_controller = require('../controllers/categoryController');
const item_controller = require('../controllers/itemController');

// Home Page Route //
router.get("/", item_controller.index);

// Item Routes //
router.get("/item/create", item_controller.item_create_get); // Get create item form
router.post("/item/create", item_controller.item_create_post); // Post item form
router.get("/item/:id/delete", item_controller.item_delete_get); // Get request to delete Item
router.post("/item/:id/delete", item_controller.item_delete_post); // Post request to delete Item
router.get("/item/:id/update", item_controller.item_update_get); // Get request to update Item
router.post("/item/:id/update", item_controller.item_update_post); // Post request to update Item
router.get("/item/:id", item_controller.item_detail); // Get single item detail
router.get("/items", item_controller.item_list); // Get list of items

// Category Routes //
router.get("/category/create", category_controller.category_create_get);
router.post("/category/create", category_controller.category_create_post);
router.get("/category/:id/delete", category_controller.category_delete_get);
router.post("/category/:id/delete", category_controller.category_delete_post);
router.get("/category/:id/update", category_controller.category_update_get);
router.post("/category/:id/update", category_controller.category_update_post);
router.get("/category/:id", category_controller.category_detail);
router.get("/categories", category_controller.category_list)

module.exports = router;