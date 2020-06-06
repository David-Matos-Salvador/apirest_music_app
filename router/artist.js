const express=require('express');
//controlador   
const ArtistController =require('../controllers/artist');

const md_auth = require('../middlewares/aunthenticated');
//multiparty
const multiparty = require('connect-multiparty');
const md_upload=multiparty({uploadDir:'./upload/artist'});

const router =express.Router();

router.get('/artist/:id',md_auth.ensureAuth,ArtistController.getArtist);
router.post('/artist',md_auth.ensureAuth,ArtistController.saveArtist);
router.get('/artists/:page?',md_auth.ensureAuth,ArtistController.getArtists);
router.put('/artist/:id',md_auth.ensureAuth,ArtistController.updateArtists);
router.delete('/artist/:id',md_auth.ensureAuth,ArtistController.deleteArtist);
router.post('/upload-img-artist/:id',[md_auth.ensureAuth,md_upload],ArtistController.uploadImagen);
router.get('/get-img-artist/:imageFile',ArtistController.getImageFile);
module.exports=router;