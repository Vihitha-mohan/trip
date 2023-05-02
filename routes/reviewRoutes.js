const express =require('express');
const reviewController = require('../controllers/reviewController');
const router = express.Router({mergeParams:true});
const authController = require('./../controllers/authController');


router.use(authController.protect);

router.route('/').get(reviewController.getallreviews).post(authController.restrictTo('user'),reviewController.setTourUserIds,reviewController.createreview);
router.route('/:id').get(reviewController.getReview).patch(authController.restrictTo('user','admin'),reviewController.updateReview).delete(authController.restrictTo('user','admin'),reviewController.deleteReview);


module.exports = router;