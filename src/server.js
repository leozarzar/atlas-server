const express = require("express");
const routes = require("./routes");
const cors = require('cors');
const path = require('path');

const app = express();

const port = 3000;

app.listen(port);

app.use(express.json())

app.use(cors({
    origin: '*'
}));

app.use(routes);

const uploadsFolderPath = path.join(__dirname, '../uploads');
//console.log(uploadsFolderPath);

app.use('/uploads', express.static(uploadsFolderPath));

console.log(`\n> Servidor ouvindo na porta ${port}.\n`)