const express =   require('express');
//controlador
const UserController = require('../controllers/user');
//middlewares
const md_auth= require('../middlewares/aunthenticated');
//multiparty    
const multiparty = require('connect-multiparty');
const md_upload=multiparty({uploadDir:'./upload/users'});

const router =express.Router();

router.get('/Probando',md_auth.ensureAuth,UserController.pruebas);
router.post('/register',UserController.saveUser);
router.post('/login',UserController.loginUser);
router.put('/update-user/:id',md_auth.ensureAuth,UserController.updateUser);
router.post('/upload-image/:id',[md_auth.ensureAuth,md_upload],UserController.uploadImage);
router.get('/get-image/:imageFile',UserController.getImageFile);

module.exports=router;