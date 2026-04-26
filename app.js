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

    // lage administrator konto
    // if (user) {
    //     req.session.users = { id: users.id, firstname: users.firstname, lastname: users.lastname };
    // }

    req.session.users = { id: users.id, firstname: users.firstname, lastname: users.lastname };
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
    // oppsummerer operasjonen som har blitt utført
    const info = stmt.run(firstname, lastname, tlf, email, hashPassword);
    res.json({ message: "New users created", info })
});

app.get('/users', kreverInnlogging, (req, res) => {
    const users = db.prepare("SELECT * from users").all();
    res.json(users);
})

app.get('/userInfo', kreverInnlogging, (req, res) => {
    const userID = req.session.users.id;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userID);
    res.json(user);
})

// typisk rute som sender deg til et html-element
app.get('/main', kreverInnlogging, (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

app.get('/activity', kreverInnlogging, (req, res) => {
    res.sendFile(__dirname + "/hidden/activity.html");
})

// rute som viser aktiviteter
app.get('/showYourActivity', kreverInnlogging, (req, res) => {
    try {
        // henter user id fra session
        const userID = req.session.users.id;
        const allActivities = db.prepare(`SELECT * FROM activity WHERE userID = ?`).all(userID);
        res.json(allActivities);
    // hvis denne koden ikke fungerer kjører den denne erroren
    } catch (error) {
        console.error("Error after catching activities:", error);
        res.status(500).json({ message: "Could not get activities" });
    }
})

// denne spørringen blir også brukt i classes.js for å legge til at du har vært med i en klassetime
app.post('/addActivity', kreverInnlogging, (req, res) => {
    // henter info fra html-element
    const { activity, date, duration } = req.body;
    const userID = req.session.users.id;
    // console.log("Session data:", req.session.users);
    // console.log("Adding activity - UserID:", userID, "Activity:", activity, "Date:", date, "Duration:", duration);
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
// PS: denne koden funker ikke!
app.get('/showAllFriends', kreverInnlogging, (req, res) => {
    try {
        const allFriends = db.prepare(`--`).all();
        res.json(allFriends);
    } catch (error) {
        console.error("Error after catching friends:", error);
        res.status(500).json({ message: "Could not get friends" });
    }
})

// rute for å verifisere sletting
app.post("/loginDelete", kreverInnlogging, async (req, res) => {
    // henter email og passord fra html-element
    const { email, password } = req.body;
    const users = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    // sjekker om brukeren er riktig (email)
    if (!users) {
        return res.status(401).json({ message: "Wrong email or password" });
    }

    // sjekker om id-en din samsvarer med session id-en
    if (users.id !== req.session.users.id) {
        return res.status(403).json({ message: "Wrong email or password" });
    }

    // sjekker om passord er riktig, bruker bcrypt
    const passordErGyldig = await bcrypt.compare(password, users.password);
    if (!passordErGyldig) {
        return res.status(401).json({ message: "Wrong email or password"})
    }

    res.json({ message: "Successful" });
})

// rute for å slette data av en bruker
app.delete('/deleteUser', kreverInnlogging, (req, res) => {
    const { email, password } = req.body;
    const userID = req.session.users.id;
    try {
        const stmt = db.prepare("DELETE FROM users WHERE id = ?");
        stmt.run(userID)
        // ødelegger session
        req.session.destroy();
        // sender melding og sender deg til index filen
        res.json({ message: "User was successfully deleted", redirect: "index.html" })
    } catch (error) {
        console.error("Feil ved sletting av kort:", error);
        res.status(500).json({ message: "Kunne ikke slette kortet" });
    }
})

// rute for å starte prosjektet
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});