//CONECTAR MONGODB CON NODE

"use strict"; //modo estricto de JS

require("dotenv").config({ path: ".env" })
const mongoose = require("mongoose"); //cargar modulo de mongoose
const app = require("./app");

// Configuración de CORS


//

const passwordDB = process.env.PASSWORD_DB

const uri =
  `mongodb+srv://miguelangelfb19:${passwordDB}@blog.tq5vo.mongodb.net/api-rest-blog?retryWrites=true&w=majority&appName=blog`
// const localUri = 'mongodb://localhost:27017/api-rest-blog'

mongoose.Promise = global.Promise; //uso de promesas para evitar fallos a la hora de conectarnos (funionamiento interno de mongoose)
/*URL mongoDB*/
mongoose
  .connect(uri)
  .then(() => {
    console.log("La conexión a la base de datos fue realizada con éxito");
  })
  .catch((err) => {
    console.error("Error al conectar con la base de datos", err);
  }); //conexion a mongoDB

module.exports = app;
