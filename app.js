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
      if (!origin) return callback(null, true); // Permite solicitudes sin origen como las de Postman
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "El origen CORS no está permitido.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Cargar CORS (para permitir peticiones desde el FrontEnd)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://blog-react-kohl.vercel.app/");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

//Cargar MiddLewares

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



//Añadir prefijos a las rutas / cargar rutas
app.use("/api", article_routes);

//Exportar modulo (fichero actual)

module.exports = app;
