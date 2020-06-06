const express =require('express') ;
const router =express.Router();
//controlador   
const SongController =require('../controllers/song') ;
const md_auth =require('../middlewares/aunthenticated') ;


//multiparty
const multiparty =require('connect-multiparty') ;

const md_upload=multiparty({uploadDir:'./upload/song'});

router.get('/song/:id',md_auth.ensureAuth,SongController.getSong);
router.post('/song',md_auth.ensureAuth,SongController.saveSong);
router.get('/songs/:album?',md_auth.ensureAuth,SongController.getSongs);
router.put('/song/:id',md_auth.ensureAuth,SongController.updateSong);
router.delete('/song/:id',md_auth.ensureAuth,SongController.deleteSong);
router.post('/upload_song/:id',[md_auth.ensureAuth,md_upload],SongController.uploadSong);
router.get('/get_song/:songFile',SongController.getsongFile);
module.exports=router;