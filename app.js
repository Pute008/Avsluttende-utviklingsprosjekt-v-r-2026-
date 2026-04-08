const express = require("express");
const session = require("express-session");
const app = express();

const Database = require("better-sqlite3");
const db = new Database("treningDatabase.db");

const cors = require("cors");
app.use(cors());

const bcrypt = require("bcrypt");

app.use(express.json());

const port = 3000

app.use(
    session({
        secret: "hemmeligNøkkel",
        resave: true,
        saveUninitialized: true,
        cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
    })
);

app.use(express.static("public"));

function kreverInnlogging(req, res, next) {
    console.log("Auth check - Session ID:", req.sessionID, "User:", req.session.users);
    if(!req.session.users) {
        console.log("Not authenticated, redirecting to login");
        return res.redirect('/index.html');
    }
    console.log("Authenticated, allowing access");
    next();
}

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const users = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!users) {
        return res.status(401).json({ message: "Wrong email or password" });
    }

    const passordErGyldig = await bcrypt.compare(password, users.password);
    if (!passordErGyldig) {
        return res.status(401).json({ message: "Wrong email or password"})
    }

    req.session.users = { id: users.IDuser, name: users.name };
    res.json({ message: "Login successful", redirect: "/main" })
})

app.post("/logout", (req, res) => {
    req.session.destroy();
    res.json({ message: "You are logged out" });
})

app.post("/newUser", async (req, res) => {
    try {
        const { firstname, lastname, tlf, email, password } = req.body;
        console.log("Creating new user:", email);
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(password, saltRounds);
        const stmt = db.prepare("INSERT INTO users (firstname, lastname, tlfNumber, email, password) VALUES (?, ?, ?, ?, ?)");
        const info = stmt.run(firstname, lastname, tlf, email, hashPassword);
        console.log("User created successfully:", email);
        res.json({ message: "New user created", info })
    } catch (error) {
        console.error("Error creating user:", error.message);
        res.status(500).json({ message: "Error: " + error.message });
    }
});

app.get('/users', kreverInnlogging, (req, res) => {
    const users = db.prepare("SELECT * from users").all();
    res.json(users);
})

app.get('/main', kreverInnlogging, (req, res) => {
    res.sendFile(__dirname + "/hidden/index.html");
})

app.delete('/', kreverInnlogging, (req, res) => {

})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});