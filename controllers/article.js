"use strict";
let validator = require("validator");
let Article = require("../models/article");
import { s3 } from "../lib/aws-s3-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { imgsBaseUrl } from "../models/imgs-url";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

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
        if (params.image != "") article.image = params.image;
        else article.image = null;

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
      .catch(() => {
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

    Article.findById(articleID)
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

  delete: async (req, res) => {
    //Recoger id de la URL
    let articleID = req.params.id;

    //Find and delete

    try {

      // Metodo de moongose para eliminar el articulo, devuelve el articulo borrado con sus datos
      const articleRemoved = await Article.findOneAndDelete({ _id: articleID });
      
      // Si no retorna nada es que el articulo no existe
      if (!articleRemoved) {
        return res.status(404).json({
          status: "Error",
          message: "Artículo no existe o ya fue eliminado",
        });
      }

      // Eliminar imagen de AWS s3
      const s3removed = s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `master-frameworks-blog/${articleRemoved.image}`,
        })
      );

      return res.status(200).json({
        status: "Success",
        message: "Artículo borrado correctamente",
        article: articleRemoved,
      });
    } catch (error) {
      return res.status(500).send({
        status: "error",
        message: "Error en la petición al API",
        err,
      });
    }
  },

  upload: async (req, res) => {
    //Configurar modulo de multer en router/article.js (HECHO)

    //Recoger fichero de la peticion
    if (!req.file) {
      return res.status(404).json({
        status: "Error",
        message: "No hay imagen",
      });
    }

    //Conseguir el nombre y la extension del archivo
    //Nombre del fichero
    const file_name = `_date_${Date.now()}_name_${req.file.originalname}`;

    //Extension del fichero
    let file_ext = req.file.mimetype.split("/")[1];

    //comprobar la extension, solo imagenes, si no valida borrar fichero
    if (
      file_ext.toLowerCase() != "png" &&
      file_ext.toLowerCase() != "jpg" &&
      file_ext.toLowerCase() != "jpeg" &&
      file_ext.toLowerCase() != "gif"
    ) {
      //Salir y retornar error
      return res.status(404).json({
        status: "Error",
        message: "Extensión de imagen no válida, artículo guardado sin imagen",
        error: err,
      });
    } else {
      //Si todo es valido, buscar articulo y asignar nombre de la imagen y actualizar
      let articleID = req.params.id;
      // Configurar los parámetros para S3
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `master-frameworks-blog/${file_name}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      // Subir el archivo a S3
      await s3.send(new PutObjectCommand(uploadParams));

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

  getImage: async (req, res) => {
    try {
      console.log(req);
      const fileName = req.params.image;
      const fileUrl = `${imgsBaseUrl}/${fileName}`;

      return res.status(200).json({
        status: "Success",
        fileUrl,
      });
    } catch (error) {
      return res.status(500).json({
        status: "Error",
        message: "Error al obtener la imagen",
        error,
      });
    }
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
