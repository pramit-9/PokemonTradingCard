const express = require('express');
const db = require('../db_config/db_config');
const authMiddleware = require('../app/middleware/AuthMiddleware');
const dashboardController = require('../app/controllers/dashboardController');
const CardController = require('../app/controllers/card/CardController');

const categoryController = require('../app/controllers/category/categoryController');
const SetController = require('../app/controllers/set/SetController');
const SeriesController = require('../app/controllers/series/SeriesController');
const multer = require('multer');
const userDashboardController = require('../app/controllers/guestUser/userDashboardController');
const frontCardController = require('../app/controllers/card/frontCardController');
const collectionController = require('../app/controllers/collection/collectionController');
const web_routes = express.Router();

const cardStorage = multer.diskStorage({
    destination: function (req, file, cb){
        return cb(null, "./public/img/cards");
    },    
    filename:(req,file,cb)=>{
        return cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const cardUpload = multer({
    storage: cardStorage
}).single('image');


// =========================== Start Admin Routes =====================================

web_routes.get("/admin/dashboard", authMiddleware.auth, dashboardController.index);

// Card Routes
web_routes.get("/admin/cards", authMiddleware.auth, CardController.index);
web_routes.get("/admin/cards/create", authMiddleware.auth, CardController.create);
web_routes.post("/admin/cards/create", cardUpload, authMiddleware.auth, CardController.store);

web_routes.get("/admin/cards/edit/:id", authMiddleware.auth, CardController.edit);
web_routes.post("/admin/cards/edit/:id", cardUpload, authMiddleware.auth, CardController.update);

web_routes.get("/admin/cards/delete/:id", authMiddleware.auth, CardController.delete);

// Category Routes
web_routes.get("/admin/categories", authMiddleware.auth, categoryController.index);
web_routes.get("/admin/categories/create", authMiddleware.auth, categoryController.create);
web_routes.post("/admin/categories/create", authMiddleware.auth, categoryController.store);

web_routes.get("/admin/categories/edit/:id", authMiddleware.auth, categoryController.edit);
web_routes.post("/admin/categories/edit/:id", authMiddleware.auth, categoryController.update);

web_routes.get("/admin/categories/delete/:id", authMiddleware.auth, categoryController.delete);

// Sets/Base Table
web_routes.get("/admin/sets", authMiddleware.auth, SetController.index);
web_routes.get("/admin/sets/create", authMiddleware.auth, SetController.create);
web_routes.post("/admin/sets/create", authMiddleware.auth, SetController.store);

web_routes.get("/admin/sets/edit/:id", authMiddleware.auth, SetController.edit);
web_routes.post("/admin/sets/edit/:id", authMiddleware.auth, SetController.update);

web_routes.get("/admin/sets/delete/:id", authMiddleware.auth, SetController.delete);

// Series Routes
web_routes.get("/admin/series", authMiddleware.auth, SeriesController.index);

web_routes.get("/admin/series/create", authMiddleware.auth, SeriesController.create);
web_routes.post("/admin/series/create", authMiddleware.auth, SeriesController.store);

web_routes.get("/admin/series/edit/:id", authMiddleware.auth, SeriesController.edit);
web_routes.post("/admin/series/edit/:id", authMiddleware.auth, SeriesController.update);
web_routes.get("/admin/series/delete/:id", authMiddleware.auth, SeriesController.delete);

// =========================== End Admin Routes =====================================

// =========================== Start User Routes =====================================

web_routes.get("/user/dashboard", authMiddleware.userAuth, userDashboardController.index);
web_routes.post("/user/delete-from-collection/:pokemonid", authMiddleware.userAuth, userDashboardController.delete_from_collection);


// =========================== End User Routes =====================================


// =========================== Start FrontIn Routes =====================================
web_routes.get("/",frontCardController.index)
web_routes.post("/filter", frontCardController.searchDataByInput);


web_routes.get("/card/:id", frontCardController.single)
web_routes.post("/save-to-collection", collectionController.store);
web_routes.get("/collections/:userid", collectionController.showCollectionById);
web_routes.get("/not-in-collection/:userid", collectionController.showNotInCollectionById);
web_routes.get('/sort-cards/:sortOrder',collectionController.sortOrder);
web_routes.get('/sort-cards-from/:sortOrderfrom',collectionController.sortOrderFrom);
web_routes.get('/sort-cards-from-set/:sortSet',collectionController.sortOrderFromSet);



web_routes.get('/logout', (req, res) => {
    // Clear the user session or token, depending on your authentication mechanism
    res.clearCookie('user'); // cookies is storing Name which value is user
  
    // Redirect the user to the login page or another appropriate page
    res.redirect('/');
  });
// End front in route


// =========================== End FrontIn Routes =====================================


module.exports = web_routes;