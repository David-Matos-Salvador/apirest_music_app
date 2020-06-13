const path = require('path');
const fs = require('fs');
//paginacion
const mongoosePaginate = require('mongoose-pagination');
//modelos
const Artist = require('../models/artist');
const Album = require('../models/album');
const Song = require('../models/song');


function getArtist(req, res) {
    const artisId = req.params.id;
    Artist.findById(artisId, (err, artist) => {
        if (err) {
            res.status(500).send({ message: 'Error al  actualizar' });
        } else {
            if (!artist) {
                res.status(404).send({ message: 'No se ha podido actualizar' });
            } else {
                res.status(200).send({ artist });
            }
        }
    })

}
function saveArtist(req, res) {
    const artist = new Artist();
    const params = req.body;
    artist.name = params.name;
    artist.description = params.description;
    artist.image = 'null';
    artist.save((err, artistStored) => {
        if (err) {
            res.status(500).send({ message: 'error al guardar artista' });
        } else {
            if (!artistStored) {
                res.status(404).send({ message: 'El artista no ha sido guardado' });
            } else {
                res.status(200).send({ artist: artistStored });
            }

        }
    })
}
function getArtists(req, res) {
    var numpage = req.params.page;
    const page = numpage ? numpage : 1;
    var itemPerPage = 4;
    Artist.find().sort('name').paginate(page, itemPerPage, (err, artists, total) => {
        if (err) {

        } else {
            if (!artists) {
                res.status(404).send({ message: 'No hay Artistas !!' });
            } else {

                res.status(200).send({ TotalArtist: total, artists: artists });
            }
        }
    })


}
function updateArtists(req, res) {
    var artisId = req.params.id;
    var params = req.body;
    Artist.findByIdAndUpdate(artisId, params, (err, artistUpdate) => {
        if (err) {
            res.status(500).send({ message: 'Error en al actualizar' });
        }
        else {
            if (!artistUpdate) {
                res.status(404).send({ message: 'Error al actualizar artista' });
            } else {
                res.status(200).send({ artistUpdate });
            }
        }
    })
}
function deleteArtist(req, res) {
    var artisId = req.params.id
    Artist.findByIdAndRemove(artisId, (err, artistRemove) => {
        if (err) {
            res.status(500).send({ message: 'Error al eliminar artista' })
        } else {
            if (!artistRemove) {
                res.status(404).send({ message: 'No se ha podido eliminar el artista' });
            } else {
                Album.deleteMany({ artist: artistRemove._id }, (err, AlbumRemove) => {
                    if (err) {
                        res.status(500).send({ message: 'Error al eliminar el album' });
                    } else {
                        if (!AlbumRemove) {
                            res.status(404).send({ message: 'No se ha podido eliminar los albumnes' });
                        } else {

                            Song.deleteMany({ album: AlbumRemove._id }, (err, songRemove) => {
                                if (err) {
                                    res.status(500).send({ message: 'Error al eliminar las canciones' });
                                } else {
                                    if (!songRemove) {
                                        res.status(404).send({ message: 'No se ha podido eliminar las canciones' });
                                    } else {
                                        res.status(200).send({ artist: artistRemove });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });
}

function uploadImagen(req, res) {
    var userId = req.params.id;
    var file_name = 'No subido ...';

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('/');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        if (file_ext == 'png' || file_ext=='jpg' || file_ext=='gif') {
            Artist.findByIdAndUpdate(userId, { image: file_name }, (err, imgUpdate) => {
                if (!imgUpdate) {
                    res.status(404).send({
                        message: 'No se ha podido actualizar la imagen'
                    })

                } else {
                    res.status(200).send({ artist: imgUpdate })
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
    var path_file = './upload/artist/' + imageFile;
    if (fs.existsSync(path_file)) {
        res.sendFile(path.resolve(path_file));

    } else {
        res.status(200).send({ message: 'No existe la Imagen :c' });
    }
}
module.exports = {
    getArtist,
    saveArtist,
    getArtists,
    updateArtists,
    deleteArtist,
    uploadImagen,
    getImageFile
}