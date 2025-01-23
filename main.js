const express = require('express');
const path = require('path');

// Crear una instancia de Express
const app = express();

// Puerto en el que correrá el servidor
const PORT = 3000;

// Servir archivos estáticos desde la carpeta actual
app.use(express.static(path.join(__dirname)));

// Ruta principal que sirve el archivo index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
