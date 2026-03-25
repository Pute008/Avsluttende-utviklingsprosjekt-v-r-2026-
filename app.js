const express = require("express");
const session = require("express-session");
const app = express();

const Database = require("better-sqlite3");
// const db = new Database("");

const cors = require("cors");
app.use(cors());

const bcrypt = require("bcrypt");

app.use(express.static('public'))

app.use(express.json());

const port = 3000

app.use(
    session({
        secret: "hemmeligNøkkel",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }
    })
);

function kreverInnlogging(req, res, next) {
    if(!req.session.user) {
        return res.redirect('/index.html');
    }
    next();
}

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM user WHERE email = ?").get(email);
    if (!user) {
        return res.status(401).json({ message: "Wrong email or password" });
    }

    const passordErGyldig = await bcrypt.compare(password, user.password);
    if (!passordErGyldig) {
        return res.status(401).json({ message: "Wrong email or password"})
    }

    req.session.user = { id: user.IDuser, name: user.name };
    res.json({ message: "Login successful", redirect: "/main" })
})

app.post("/logout", (req, res) => {
    req.session.destroy();
    res.json({ message: "You are logged out" });
})

app.post("/newUser", async (req, res) => {
    const { name, email, password } = req.body;
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const stmt = db.prepare("INSERT INTO user (name, email, password) VALUES (?, ?, ?)");
    const info = stmt.run(name, email, hashPassword);
    res.json({ message: "New user created", info })
});

app.get('/', kreverInnlogging, (req, res) => {

})

app.post('/', kreverInnlogging, (req, res) => {
    
})

app.delete('/', kreverInnlogging, (req, res) => {

})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});