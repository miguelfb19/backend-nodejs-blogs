//CONECTAR MONGODB CON NODE

'use strict' //modo estricto de JS

const mongoose = require('mongoose') //cargar modulo de mongoose
const app = require('./app')
const port = 3900

mongoose.Promise = global.Promise //uso de promesas para evitar fallos a la hora de conectarnos (funionamiento interno de mongoose)
                                /*URL mongoDB*/             
mongoose.connect('mongodb://localhost:27017/api-rest-blog')
        .then(()=>{
            console.log('La conexión a la base de datos fue realizada con éxito')

            //Crear servidor y escuchar peticiones HTTP
            app.listen(port, () => {
                console.log(`Servidor corriendo en http://localhost:${port}`)
            })
}) //conexion a mongoDB




