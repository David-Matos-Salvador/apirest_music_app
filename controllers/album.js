const path = require('path');
const fs =require('fs');
//paginacion
const mongoosePaginate = require('mongoose-pagination');
//modelos
const Artist=require('../models/artist');
const Album=require('../models/album');
const Song =require('../models/song');




function getAlbum(req,res){
    let albumId = req.params.id;

    Album.findById(albumId).populate('artist').exec((err,album)=>{
        if (err) {
            res.status(500).send({message:'ha ocurrido un error'});
        } else {
            if (!album) {
                res.status(404).send({message:'No ha encontrado el album'});
            }else{
                res.status(200).send({album});
            }
        }
    })
}

function saveAlbum(req,res){
    const album = new Album();
    const params = req.body;    
    album.title=params.title;
    album.description=params.description;
    album.year=params.year;
    album.image='null';
    album.artist=params.artist;
    album.save((err,saveAlbum)=>{
        if (err) {
            res.status(500).send({message:'Error al  ejecutar la peticion'})           
        }else{
            if (!saveAlbum) {
                res.status(404).send({message:'Error al guardar el Album '})      
            } else {
                res.status(200).send({album:saveAlbum})      
            }
        }
    })
}

function getAlbums(req, res) {
    let artistId = req.params.id;
    if (!artistId) {
         find = Album.find().sort('title');
    } else {
         find =Album.find({artist:artistId}).sort('year');
    }
    find.populate('artist').exec((err,albums)=>{
        if (err) {
            res.status(500).send({message:'Error al  ejecutar la peticion'}) 
        } else {
            if (!albums) {
            res.status(404).send({message:'No hay albums'}) 
            }else{
                res.status(200).send({albums}) 
            }
        }
    });
}

function updateAlbum(req,res){
    let albumId =req.params.id
    let update=req.body;
    Album.findByIdAndUpdate(albumId,update,(err,albumUpdate)=>{
        if (err) {
            res.status(500).send({message:'Ha ocurrido un error :c'}) 
        } else {
            if (!albumUpdate) {
                
            } else {
                res.status(200).send({album:albumUpdate})                 
            }
        }
    })
}
function deleteAlbum(req,res) {
    let albumId =req.params.id
    Album.findByIdAndRemove(albumId,(err,AlbumRemove)=>{
        if (err) {
            res.status(500).send({message:'Error al eliminar el album'});
        } else {
            if (!AlbumRemove) {
                res.status(404).send({message:'No se ha podido eliminar los albumnes'});
            } else {
               
                Song.deleteMany({album:AlbumRemove._id},(err,songRemove)=>{
                    if (err) {
                        res.status(500).send({message:'Error al eliminar las canciones'});
                    } else {
                        if (!songRemove) {
                            res.status(404).send({message:'No se ha podido eliminar las canciones'});
                        } else {
                            res.status(200).send({album:AlbumRemove});
                        }                                    
                    }
                });
            }
        }
    });
}
function uploadImagen(req, res) {
    let albumId = req.params.id;
    let file_name = 'No subido ...';

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
             file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        if (file_ext == 'png' || file_ext=='jpg' || file_ext=='gif') {
            Album.findByIdAndUpdate(albumId, { image: file_name }, (err, imgUpdate) => {
                if (!imgUpdate) {
                    res.status(404).send({
                        message: 'No se ha podido actualizar la imagen'
                    })

                } else {
                    res.status(200).send({ album: imgUpdate })
                }
            })
        } else {
            res.status(404).send({
                message: 'extension de archivo no valido'
            })

        }

        console.log(file_path);
    } else {
        res.status(200).send({
            message: 'No has subido ninguna imagen'
        })
    }
}

function getImageFile(req, res) {
    var imageFile = req.params.imageFile;
    var path_file = './upload/album/' + imageFile;
    if (fs.existsSync(path_file)) {
        res.sendFile(path.resolve(path_file));

    } else {
        res.status(200).send({ message: 'No existe la Imagen :c' });
    }
}
module.exports={getAlbum,saveAlbum,getAlbums,updateAlbum,deleteAlbum,uploadImagen,getImageFile}