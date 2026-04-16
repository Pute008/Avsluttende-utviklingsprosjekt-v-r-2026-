const express = require("express");
const session = require("express-session");
const app = express();

const Database = require("better-sqlite3");
const db = new Database("treningDatabase.db");

const cors = require("cors");
app.use(cors());

const bcrypt = require("bcrypt");

app.use(express.static("public"));

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
    if(!req.session.users) {
        return res.redirect('/index.html');
    }
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
    res.json({ message: "Login successful", redirect: "index2.html" })
})

app.post("/logout", (req, res) => {
    req.session.destroy();
    res.json({ message: "You are logged out" });
})

app.post("/newUser", async (req, res) => {
    const { firstname, lastname, tlf, email, password } = req.body;
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const stmt = db.prepare("INSERT INTO users (firstname, lastname, tlfNumber, email, password) VALUES (?, ?, ?, ?, ?)");
    const info = stmt.run(firstname, lastname, tlf, email, hashPassword);
    res.json({ message: "New users created", info })
});

app.get('/users', kreverInnlogging, (req, res) => {
    const users = db.prepare("SELECT * from users").all();
    res.json(users);
})

app.get('/main', kreverInnlogging, (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

app.get('/activity', kreverInnlogging, (req, res) => {
    res.sendFile(__dirname + "/hidden/activity.html");
})

// lage sql spørring
app.get('/showYourActivity', kreverInnlogging, (req, res) => {
    try {
        const allClasses = db.prepare(`--`).all();
        res.json(allClasses);
    } catch (error) {
        console.error("Error after catching classes:", error);
        res.status(500).json({ message: "Could not get classes" });
    }
})

// legge til sql spørring
app.post('/addActivity', kreverInnlogging, (req, res) => {
    const { activity, date, duration } = req.body;
    const userID = req.session.users.id;
    try {
        const stmt = db.prepare(`INSERT INTO activity (activity, date, duration, userID) VALUES (?, ?, ?, ?)`);
        const info = stmt.run(activity, date, duration, userID);
        res.json({ message: "Activity added successfully", info });
    } catch (error) {
        console.error("Error after catching info:", error);
        res.status(500).json({ message: "Could not send info" });
    }
})

app.get('/friendList', kreverInnlogging, (req, res) => {
    res.sendFile(__dirname + "/hidden/friendList.html");
})

app.get('/classes', kreverInnlogging, (req, res) => {
    res.sendFile(__dirname + "/hidden/classes.html");
})

app.get('/showAllClasses', kreverInnlogging, (req, res) => {
    try {
        const allClasses = db.prepare(`SELECT classes.title, classes.notes,
            users.firstname, users.lastname, classes.maxParticipants, classes.timeMinutes
            FROM classes
            INNER JOIN users
            ON classes.instructor = users.id;`).all();
        res.json(allClasses);
    } catch (error) {
        console.error("Error after catching classes:", error);
        res.status(500).json({ message: "Could not get classes" });
    }
})

// må oppdatere og fikse sql spørringen
app.get('/showAllFriends', kreverInnlogging, (req, res) => {
    try {
        const allFriends = db.prepare(`--`).all();
        res.json(allFriends);
    } catch (error) {
        console.error("Error after catching friends:", error);
        res.status(500).json({ message: "Could not get friends" });
    }
})

app.delete('/', kreverInnlogging, (req, res) => {

})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});