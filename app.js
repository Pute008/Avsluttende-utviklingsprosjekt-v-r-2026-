const express = require("express");
const session = require("express-session");

const Database = require("better-sqlite3");

const cors = require("cors");
app.use(cors());

const cors = require("bcrypt");

app.use(express.static('public'))

app.use(express.json);

const port = 3000

app.get('/', kreverInnlogging, (req, res) => {

})

app.post('/', kreverInnlogging, (req, res) => {
    
})

app.delete('/', kreverInnlogging, (req, res) => {

})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});