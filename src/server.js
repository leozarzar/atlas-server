const express = require("express");
const routes = require("./routes");

const app = express();

const port = 3000;

app.listen(port);
app.use(express.json())

app.use(routes);

console.log(`\n> Servidor ouvindo na porta ${port}.\n`)