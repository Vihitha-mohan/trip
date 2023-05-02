const express =require('express');
const multer = require('multer');
const {getAllUsers,getUsers,createUser,getaUser,updateUser,deleteUser,getMe,updateMe, deleteMe,uploadUserPhoto,resizeUserPhoto} =require('../controllers/userController');
const authController = require('../controllers/authController');



const router = express.Router();

// router.post('/signup',authController.signup);
router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);

router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

//protect all router after the middleware
router.use(authController.protect);
router.patch('/updateMyPassword',authController.updatePassword);
router.get('/me',getMe,getaUser);
router.patch('/updateMe',uploadUserPhoto,resizeUserPhoto,updateMe);
router.delete('/deleteMe',deleteMe);

router.use(authController.restrictTo('admin'));
router.route('/').get(getAllUsers).get(getUsers).post(createUser);
router.route('/:id').get(getaUser).patch(updateUser).delete(deleteUser);

module.exports=router;