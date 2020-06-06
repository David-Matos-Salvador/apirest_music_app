const path = require('path');
const fs =require('fs');
//paginacion
const mongoosePaginate = require('mongoose-pagination');
//modelos
const Artist=require('../models/artist');
const Album=require('../models/album');
const Song =require('../models/song');



function getSong(req,res) {
    let sonId=req.params.id;

    Song.findById(sonId).populate('album').exec((err,song)=>{
        if (err) {
            res.status(500).send({message:'error al realizar la operacion '});
        } else {
            if (!song) {
                res.status(404).send({message:'La cancion no existe'});
            } else {
                res.status(200).send({song});
            }
        }
    })
}

function getSongs(req,res) {
    let albumId=req.params.album;

    let find;
    if (!albumId) {
        find=Song.find({}).sort('number');        
    } else {
        find=Song.find({album:albumId}).sort('number');
    }
    
    find.populate({path:'album',populate:{path:'artist',model:'Artist'}}).exec(function (err,songs) {
        if (err) {
            res.status(500).send({message:'error al realizar la operacion '});
        } else {
            if (!songs) {
                res.status(404).send({message:'No hay canciones !!'});
            } else {
                res.status(200).send({songs});
            }
        }

        
    })

}

function saveSong(req,res) {
    let song = new Song();
    
    let params= req.body;
    song.number=params.number;
    song.name=params.name;
    song.duration=params.duration
    song.file=null;
    song.album=params.album;

    song.save((err,songStored)=>{
        if (err) {
            res.status(500).send({message:'error al realizar la operacion '});
        } else {
            if (!songStored) {
                res.status(404).send({message:'error al guardar la cancion '});
            } else {
                res.status(200).send({song:songStored});   
            }
        }
    })
    
}
function updateSong(req,res) {

    let songId=req.params.id;
    let update=req.body;

    Song.findByIdAndUpdate(songId,update,(err,songUpdate)=>{
        if (err) {
            res.status(500).send({message:'error al realizar la peticion'})
        } else {
            if (!update) {
                res.status(404).send({message:'No se pudo actualizar la cancion'})
                
            } else {
                res.status(200).send({song:songUpdate})
            }
        }
    })
    
}
function deleteSong(req,res) {
    let  sonId=req.params.id;
    Song.findByIdAndDelete(sonId,(err,songRemove)=>{
        if (err) {
            res.status(500).send({message:'error al realizar la peticion'})
        } else {
            if (!songRemove) {
                res.status(404).send({message:'no se pudo eliminar la cancion'})
            } else {
                res.status(200).send({song:songRemove})
            }
            
        }
    })
    
}
function uploadSong(req, res) {
    let songId = req.params.id;
    let file_name = 'No subido ...';

    if (req.files) {
        var file_path = req.files.file.path;
        var file_split = file_path.split('\\');
             file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        if (file_ext == 'mp3' || file_ext=='ogg' ) {
            Song.findByIdAndUpdate(songId, { file: file_name }, (err, songUpdate) => {
                if (!songUpdate) {
                    res.status(404).send({
                        message: 'No se ha podido actualizar el audio'
                    })

                } else {
                    res.status(200).send({ song: songUpdate })
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
            message: 'No has subido ninguna audio'
        })
    }
}

function getsongFile(req, res) {
    var songFile = req.params.songFile;
    var path_file = './upload/song/' + songFile;
    if (fs.existsSync(path_file)) {
        res.sendFile(path.resolve(path_file));

    } else {
        res.status(200).send({ message: 'No existe el audio :c' });
    }
}
module.exports={getSong,saveSong,getSongs,updateSong,deleteSong,uploadSong,getsongFile}