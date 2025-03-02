"use strict";

const express = require("express");
const ArticleController = require("../controllers/article");
const upload = require("../lib/multer");

const router = express.Router();


//Rutas para articulo (utiles)
router.post("/save", ArticleController.save);
router.get("/articles/:last?", ArticleController.getArticles);
router.get("/article/:id", ArticleController.getArt);
router.put("/article/:id", ArticleController.update);
router.delete("/article/:id", ArticleController.delete);
router.post(
  "/upload-image/:id",
  upload.single("file0"),
  ArticleController.upload
);
router.get("/get-image/:image", ArticleController.getImage);
router.get("/search/:search", ArticleController.search);

module.exports = router;

//RUTAS DE MI SERVIDOR PARA LOS DIFERENTES METODOS
