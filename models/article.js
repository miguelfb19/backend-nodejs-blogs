//CREO UN MODELO (CLASE) PARA ESQUEMATIZAR LOS ARTICULOS QUE TENDRE EN MI PAGINA

"use strict";

let mongoose = require("mongoose"); //cargar mongoose
let Schema = mongoose.Schema;

let ArticleSchema = Schema({
  title: String,
  content: String,
  date: { type: Date, default: Date.now }, //Date.now me guarda la fecha actual
  image: String,
});

module.exports = mongoose.model("Article", ArticleSchema);
//articles --> guarda documentos de este tipo y estructura dentro de la coleccion
