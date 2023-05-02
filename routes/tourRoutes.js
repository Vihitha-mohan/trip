const express =require('express');
const {getTours,createTour,getaTour,updateTour,deleteTour,checkID,checkBody,aliasTopTours,getTourStats,getMonthlyPlan,getToursWithin,getDistances,uploadTourImages,resizeTourImages}=require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const router = express.Router();
//const reviewController = require('../controllers/reviewController');
const reviewRouter = require('../routes/reviewRoutes');
//router.param('id',checkID);

//POST /tour/23563/reviews
//GET /tour/23563/reviews
//GET /tour/23563/reviews/1254a
//router.route('/:tourid/reviews').post(authController.protect,authController.restrictTo('user'),reviewController.createreview);
router.use('/:tourid/reviews',reviewRouter);

router.route('/top-5-cheap').get(aliasTopTours,getTours);
router.route('/monthly-plan/:year').get(authController.protect, authController.restrictTo('admin','lead-guide','guides'),getMonthlyPlan);
router.route('/tour-stats').get(getTourStats);
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(getDistances)
router.route('/').get(getTours).post(authController.protect, authController.restrictTo('admin','lead-guide'), createTour);
router.route('/:id').get(getaTour).patch(authController.protect, authController.restrictTo('admin','lead-guide'),uploadTourImages,resizeTourImages,updateTour).delete(authController.protect, authController.restrictTo('admin','lead-guide'), deleteTour);




module.exports=router;