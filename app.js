"use strict";

//CREAR NUESTRO SERVIDOR WEB

//Cargar modulos de Node para crear servidor

let express = require("express");
let bodyParser = require("body-parser");
const cors = require("cors");

//Ejecutar Express para tabajar con HTTP

let app = express();

//Cargar ficheros rutas

let article_routes = require("./routes/article");

//Configuración de CORS

const allowedOrigins = [
  "https://blog-angular-sigma.vercel.app",
  "https://blog-react-kohl.vercel.app",
  "https://blog-vuejs-alpha.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4200",
]; // Agrega tu frontend aquí

app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


//Cargar MiddLewares

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



//Añadir prefijos a las rutas / cargar rutas
app.use("/api", article_routes);

//Exportar modulo (fichero actual)

module.exports = app;
