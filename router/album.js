const express =require('express') ;
const router =express.Router();
//controlador   
const AlbumController =require('../controllers/album') ;
const md_auth =require('../middlewares/aunthenticated') ;


//multiparty
const multiparty =require('connect-multiparty') ;

const md_upload=multiparty({uploadDir:'./upload/album'});

router.get('/album/:id',md_auth.ensureAuth,AlbumController.getAlbum);
router.post('/album',md_auth.ensureAuth,AlbumController.saveAlbum);
router.get('/albums/:id?',md_auth.ensureAuth,AlbumController.getAlbums);
router.put('/album/:id',md_auth.ensureAuth,AlbumController.updateAlbum);
router.delete('/album/:id',md_auth.ensureAuth,AlbumController.deleteAlbum);
router.post('/upload-img-album/:id',[md_auth.ensureAuth,md_upload],AlbumController.uploadImagen);
router.get('/get-img-album/:imageFile',AlbumController.getImageFile);
module.exports=router;