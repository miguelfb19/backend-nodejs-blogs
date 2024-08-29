"use strict";
let validator = require("validator");
let Article = require("../models/article");
let fs = require("fs");
let path = require("path");
const { exec } = require("child_process");
const { log } = require("console");

//CREANDO EL CONTROLLER QUE CONTIENE LOS METODOS PARA MI SERVIDOR

let controller = {

  save: (req, res) => {
    //recoger parametros por POST
    let params = req.body;

    //Validar datos (validator)
    try {
      if (
        validator.isEmpty(params.title) ||
        validator.isEmpty(params.content)
      ) {
        throw new Error("DATOS INVÁLIDOS O INCOMPLETOS");
      } else {
        //crear objeto a guardar
        let article = new Article();

        //asignar valores
        article.title = params.title;
        article.content = params.content;
        if(params.image!='') article.image = params.image;
        else article.image=null
        
        

        //guardar articulo en la base de datos
        article
          .save()
          .then(() => {
            return res.status(200).send({
              status: "success",
              message: "Artículo guardado exitosamente",
              article,
            });
          })
          .catch((error) => {
            console.log("¡¡¡ERROR!!!");
            return res.status(500).send({
              status: "error",
              message: "Error al guardar el artículo",
            });
          });
      }
    } catch (err) {
      return res.status(400).send({
        status: "error",
        message: err.message || "Error inesperado",
      });
    }
  },

  getArticles: (req, res) => {
    let query = Article.find({});

    let last = req.params.last;
    if (last || last != undefined) {
      //este codigo me crea un limite de articulos que va a mostrar por medio de una ruta adicional en el mismo metodo
      query.limit(5);
    }

    //Find (para sacar datos de los articulos)

    query
      .sort([["date", "descending"]])
      .then((articles) => {
        if (!articles) {
          return res.status(404).send({
            status: "Error",
            message: "No hay artículos para mostrar",
          });
        }
        return res.status(200).send({
          articles: articles,
          status: "success",
        });
      })
      .catch((err) => {
        return res.status(500).send({
          message: "Error al mostrar artículos...",
        });
      });
  },

  getArt: (req, res) => {
    //Recoger el id por la URL
    let articleID = req.params.id;

    //Comprobar que existe
    if (!articleID || articleID == null) {
      return res.status(404).send({
        status: "Error",
        message: "No existe el artículo",
      });
    }

    //Buscar el articulo

    Article.findById(articleID) //Se usa Promises con then y catch
      .then((article) => {
        if (!article) {
          return res.status(404).send({
            status: "Error",
            message: "Artículo no existente",
          });
        }
        //Devolver el articulo en JSON
        return res.status(200).send({
          status: "Success",
          article,
        });
      })
      .catch((err) => {
        return res.status(500).send({
          status: "Error",
          message: "Error al visualizar artículo",
          err,
        });
      });
  },

  update: (req, res) => {
    //Recoger id del articulo por la URL
    let articleID = req.params.id;

    //recoger datos que llegan por put
    let params = req.body;

    //validar datos recogidos
    let validateTitle;
    let validateContent;
    try {
      validateTitle = !validator.isEmpty(params.title);
      validateContent = !validator.isEmpty(params.content);
    } catch (err) {
      return res.status(404).json({
        status: "Error",
        message: "Faltan datos por enviar",
      });
    }

    if (validateTitle && validateContent) {
      //find and update
      Article.findOneAndUpdate({ _id: articleID }, params, { new: true }).then(
        (articleUpdate) => {
          if (!articleUpdate) {
            return res.status(404).json({
              status: "Error",
              message: "No existe el articulo",
            });
          }

          return res.status(200).json({
            status: "Success",
            message: "Artículo actualizado correctamente",
            article: articleUpdate,
          });
        }
      );
    } else {
      return res.status(404).json({
        status: "Error",
        message: "La validacion de los datos no es correcta",
      });
    }
  },

  delete: (req, res) => {
    //Recoger id de la URL
    let articleID = req.params.id;

    //Find and delete

    Article.findOneAndDelete({ _id: articleID })
      .then((articleRemoved) => {
        if (!articleRemoved) {
          return res.status(404).json({
            status: "Error",
            message: "Error al borrar artículo",
          });
        } else {
          return res.status(200).json({
            status: "Success",
            message: "Artículo borrado correctamente",
            article: articleRemoved,
          });
        }
      })
      .catch((err) => {
        if (err) {
          return res.status(500).send({
            status: "error",
            message: "Error en la petición al API",
            err,
          });
        }
      });
  },

  upload: (req, res) => {
    //Configurar modulo de connect multiparty router/article.js (HECHO)

    //Recoger fichero de la peticion
    let fileName = "Imagen no subida";

    if (!req.files) {
      return res.status(404).json({
        status: "Erorr",
        message: fileName,
      });
    }

    //Conseguir el nombre y la extension del archivo
    let file_path = req.files.file0.path;
    console.log('console desde backend');
    console.log(req.files.file0.path);
    let file_split = file_path.split("/"); //*ADVERTENCIA* EN LINUX O MAC: let file_split = file_path.split('/') EN WINDOWS: let file_split = file_path.split('\\')

    //Nombre del fichero
    let file_name = file_split[2];
    //Extension del fichero
    let ext_split = file_name.split(".");
    let file_ext = ext_split[1];

    //comprobar la extension, solo imagenes, si no valida borar fichero
    if (
      file_ext.toLowerCase() != "png" &&
      file_ext.toLowerCase() != "jpg" &&
      file_ext.toLowerCase() != "jpeg" &&
      file_ext.toLowerCase() != "gif"
    ) {
      //Borrar el archivo
      fs.unlink(file_path, (err) => {
        return res.status(404).json({
          status: "Error",
          message: "Extensión de imagen no válida",
        });
      });
    } else {
      //Si todo es valido, buscar articulo y asignar nombre de la imagen y actualizar
      let articleID = req.params.id;

      Article.findOneAndUpdate(
        { _id: articleID },
        { image: file_name },
        { new: true }
      )
        .then((articleUpdated) => {
          if (!articleUpdated) {
            return res.status(404).json({
              status: "Error",
              message: "Error al subir imagen",
            });
          }

          return res.status(200).json({
            status: "Success",
            article: articleUpdated,
          });
        })
        .catch((err) => {
          if (err) {
            return res.status(500).send({
              status: "Error",
              message: "Error en la petición.",
              err,
            });
          }
        });
    }
  },

  getImage: (req, res) => {
    let file = req.params.image;
    let path_file = "./upload/articles/" + file;

    fs.exists(path_file, (exists) => {
      if (exists) {
        return res.sendFile(path.resolve(path_file));
      } else {
        return res.status(404).json({
          status: "Error",
          message: "La imagen no existe",
        });
      }
    });
  },

  search: (req, res) => {
    // Sacar el string a buscar
    let searchString = req.params.search;

    // Find or determina si el string del buscador coincide con el titulo o el contenido de uno o varios articulos
    Article.find({
      $or: [
        { title: { $regex: searchString, $options: "i" } },
        { content: { $regex: searchString, $options: "i" } },
      ],
    })
      .sort([["date", "descending"]])
      .exec()
      .then((articles) => {
        if (articles && articles.length > 0) {
          return res.status(200).send({
            status: "success",
            articles,
          });
        } else {
          return res.status(200).send({
            status: "Error",
            message: "No hay articulos que coincidan con tu búsqueda.",
            articles,
          });
        }
      })
      .catch((err) => {
        if (err) {
          return res.status(500).send({
            status: "Error",
            message: "Error en la petición.",
            err,
          });
        }
      });
  },
};

//final del controller

module.exports = controller;
