# **Avsluttende Utviklingsprosjekt Vår 2026**
av Felix Ellingsen Westby

| Component | Kodespråk / teknologi |
|-----------|--------------|
| Frontend | HTML5, CSS, JavaScript |
| Backend | Node.JS, Express.JS |
| Database | SQLite |
| Server Port | 3000 |

# Kom i gang
1. Klon repoet
2. Kjør npm install
3. Last ned alle pakker du trenger (ligger også under backend)
## Notater

I dette prosjektet skal jeg lage en nettside hvor du logge at du har vært på trening, hvor du kan bli venner med andre brukere. Administrator brukere kan opprette treningstimer som andre brukere kan melde seg på

Hva jeg må ha med
- [X] Database (SQL eller MariaDB)
- [x] Node - app.js
- [x] public mappe
- [x] hidden mappe
- [X] ruter og api endepunkter
- [X] classes - viser klassene

- [ ] friend-list (skrivefunksjon! folk må skrive inn ID-en!)
- [X] activity (bruke chart-js for å lage statistikk)
- [X] registration (lage en lenke av url-en)

- [X] logout (må jobbe mer med)


# Hva jeg lager
I dette prosjektet lager jeg en nettside hvor du kan logge treningen din. Du har mulighet til å registrere at du har trent, og du kan melde deg på en treningstime, dette vil bli registrert som en aktivitet du har deltatt på. Jeg har lagd en funksjon som gjør det mulig å slette brukeren sin.

# Databasen

<img src="pictures/AvsluttendeProgramVår2026.jpg.png" alt="databasemodell" width="800px">

### users

| Key | Column    | Type                  |
|-----|-----------|-----------------------|
| PK  | id        | INTEGER AUTOINCREMENT |
|     | firstname | TEXT NOT NULL         |
|     | lastname  | TEXT NOT NULL         |
|     | tlfNumber | INTEGER               |
|     | email     | TEXT NOT NULL         |
|     | password  | TEXT NOT NULL         |

### activity

| Key | Column   | Type                                  |
|-----|----------|---------------------------------------|
| PK  | id       | INTEGER AUTOINCREMENT                 |
|     | activity | TEXT NOT NULL                         |
|     | date     | TEXT NOT NULL                         |
|     | duration | INTEGER                               |
| FK  | userID   | INTEGER → users(id) ON DELETE CASCADE |



### classes

| Key | Column          | Type                      |
|-----|-----------------|---------------------------|
| PK  | id              | INTEGER AUTOINCREMENT     |
|     | title           | TEXT NOT NULL             |
|     | notes           | TEXT                      |
| FK  | instructor      | INTEGER → users(id)       |
|     | maxParticipants | INTEGER                   |
|     | timeMinutes     | INTEGER                   |

### friendlist

| Key | Column  | Type                                  |
|-----|---------|---------------------------------------|
| PK  | id      | INTEGER AUTOINCREMENT                 |
| FK  | userID1 | INTEGER → users(id) ON DELETE CASCADE |
| FK  | userID2 | INTEGER → users(id) ON DELETE CASCADE |
|     | time    | INTEGER                               |

### schedules

| Key | Column          | Type                      |
|-----|-----------------|---------------------------|
| PK  | id              | INTEGER AUTOINCREMENT     |
| FK  | classID         | INTEGER → classes(id)     |
|     | startTime       | INTEGER                   |
|     | room            | TEXT NOT NULL             |
|     | availablePlaces | INTEGER                   |

### registration

| Key | Column | Type                       |
|-----|--------|----------------------------|
| PK  | id     | INTEGER AUTOINCREMENT      |
| FK  | userID | INTEGER → users(id)        |
| FK  | timeID | INTEGER → schedules(id)    |
|     | status | TEXT                       |

# Backend

## app.js

Laster ned alle pakker for Node JS
``` js
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
```

*For å laste ned pakkene du trenger*

``` cmd
npm init -y
npm install express express-session better-sqlite3 cors bcrypt
```

Rute for å starte prosjektet (*bruker port 3000*)

``` JS
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});
```

For å kjøre prosjektet i node

```cmd
node app.js
```

### **kanskje ha med session koden??????**

Bruker denne funksjonen for å håndtere innloggingen

``` js
// man må ha session for at koden skal funke
function kreverInnlogging(req, res, next) {
    if(!req.session.users) {
        return res.redirect('/index.html');
    }
    next();
}
```

Innlogging og utlogging

``` js
// sjekker at bruker har skrevet riktig passord og email før den gi en session
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

    req.session.users = { id: users.id, firstname: users.firstname, lastname: users.lastname };
    res.json({ message: "Login successful", redirect: "index2.html" })
})

// ødelegger session når man logger ut
app.post("/logout", (req, res) => {
    req.session.destroy();
    res.json({ message: "You are logged out" });
})
```

Rute for å lage en ny bruker

``` js
app.post("/newUser", async (req, res) => {
    const { firstname, lastname, tlf, email, password } = req.body;
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const stmt = db.prepare("INSERT INTO users (firstname, lastname, tlfNumber, email, password) VALUES (?, ?, ?, ?, ?)");
    const info = stmt.run(firstname, lastname, tlf, email, hashPassword);
    res.json({ message: "New users created", info })
});
```

Ruter som sender deg til en html side

``` js
app.get('/main', kreverInnlogging, (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get('/activity', kreverInnlogging, (req, res) => {
    res.sendFile(__dirname + "/hidden/activity.html");
})

app.get('/friendList', kreverInnlogging, (req, res) => {
    res.sendFile(__dirname + "/hidden/friendList.html");
})

app.get('/classes', kreverInnlogging, (req, res) => {
    res.sendFile(__dirname + "/hidden/classes.html");
})
```

Rute som viser din aktivitet

``` js
app.get('/showYourActivity', kreverInnlogging, (req, res) => {
    try {
        const userID = req.session.users.id;
        const allActivities = db.prepare(`SELECT * FROM activity WHERE userID = ?`).all(userID);
        res.json(allActivities);
    } catch (error) {
        console.error("Error after catching activities:", error);
        res.status(500).json({ message: "Could not get activities" });
    }
})
```

Rute for å legge til en aktivitet (blir også brukt i classes.js)

``` js
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
```

Rute for å vise alle klasser

``` js
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
```

Ruter som håndterer å slette en bruker

``` js
// dobbeltsjekker at bruker er logget inn med riktig konto
app.post("/loginDelete", kreverInnlogging, async (req, res) => {
    const { email, password } = req.body;
    const users = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!users) {
        return res.status(401).json({ message: "Wrong email or password" });
    }

    if (users.id !== req.session.users.id) {
        return res.status(403).json({ message: "Wrong email or password" });
    }

    const passordErGyldig = await bcrypt.compare(password, users.password);
    if (!passordErGyldig) {
        return res.status(401).json({ message: "Wrong email or password"})
    }

    res.json({ message: "Successful" });
})

// sletter bruker
app.delete('/deleteUser', kreverInnlogging, (req, res) => {
    const { email, password } = req.body;
    const userID = req.session.users.id;
    try {
        const stmt = db.prepare("DELETE FROM users WHERE id = ?");
        stmt.run(userID)
        req.session.destroy();
        res.json({ message: "User was successfully deleted", redirect: "index.html" })
    } catch (error) {
        console.error("Feil ved sletting av kort:", error);
        res.status(500).json({ message: "Kunne ikke slette kortet" });
    }
})
```


# Frontend

## index - new user - home page

### index.html

``` html
<main>
    <form onsubmit="loginPerson(event)">
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required><br>

        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required><br>

        <button type="submit">Logg inn</button>
        <p><a href="newUser.html" class="button">New? click here to make a new user!</a></p>
    </form>
</main>
```

### login.js

``` js
async function loginPerson(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch('/login', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (response.ok) {
        alert(result.message);
        window.location.href = result.redirect;
    } else {
        alert(result.message);
    }
}
```

---

### newUser.html og js

``` html
<form id="newUserForm">
    <label for="firstname">Firstname:</label>
    <input type="text" id="firstname" name="firstname" required><br>

    <label for="lastname">Lastname:</label>
    <input type="text" id="lastname" name="lastname" required><br>

    <label for="number">Tlf number:</label>
    <input type="text" id="tlf" name="tlf" required><br>

    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required><br>

    <label for="password">Password:</label>
    <input type="password" id="password" name="password" required minlength="6"><br>
    <p id="demo"></p>

    <button type="submit">Create User</button>
</form>

<p><a href="index.html" class="button">Log inn</a></p>
```

``` js
document.getElementById("newUserForm").addEventListener("submit", async function addPerson(event) {
    event.preventDefault();

    const firstname = document.getElementById("firstname").value;
    const lastname = document.getElementById("lastname").value;
    const tlf = document.getElementById("tlf").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log(email)
    const response = await fetch("/newUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            firstname,
            lastname,
            tlf,
            email,
            password
        })
        
    });

    const result = await response.json();
    alert(result.message);
    window.location.href='./index.html';
})
```

---

### index2.html

``` html

```

### home.js

## classes

### classes.html

``` html
<main id="classList">

</main>
```

### classes.js

``` js

async function showClasses () {
    const tabellBody = document.querySelector("#classList");
    try {
        const response = await fetch("/showAllClasses")
        if (!response.ok) {
            throw new Error("Could not get the classes. Are you logged in?");
        }

        const classes = await response.json();

        console.log(classes);

        classes.forEach(classItem => {
            const rad = document.createElement("div");
            rad.classList.add('class');

            const title = document.createElement("h1");
            title.textContent = classItem.title;
            rad.appendChild(title);

            const notes = document.createElement("p");
            notes.textContent = "Notes: " + classItem.notes;
            rad.appendChild(notes);

            const fullName = document.createElement("p");
            fullName.textContent = `Instructor: ${classItem.firstname} ${classItem.lastname}`;
            rad.appendChild(fullName);

            const maxParticipants = document.createElement("p")
            maxParticipants.textContent = "Max Participants: " + classItem.maxParticipants;
            rad.appendChild(maxParticipants);

            const timeMinutes = document.createElement("p")
            timeMinutes.textContent = "Duration (minutes): " + classItem.timeMinutes;
            rad.appendChild(timeMinutes);

            const button = document.createElement("button");
            button.textContent = "Register as Activity";
            button.onclick = () => registerClassAsActivity(classItem);
            rad.appendChild(button);

            tabellBody.appendChild(rad);
        });
    } catch (error) {
        console.error("Fail:", error);
        tabellBody.innerHTML = `<div>Could not get the classes: ${error.message}</div>`;
    }
}

async function registerClassAsActivity(classItem) {
    const today = new Date().toISOString().split('T')[0];
    
    try {
        const response = await fetch("/addActivity", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                activity: classItem.title,
                date: today,
                duration: classItem.timeMinutes
            })
        });
        
        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error("Error registering class as activity:", error);
        alert("Feil: " + error.message);
    }
}
document.addEventListener("DOMContentLoaded", showClasses);
```

## options - delete user

### options.html

``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="style.css">
    <script src="options.js" defer></script>
</head>
<body>
    <header>Options</header>
    <menu>
        <li><a href="index2.html">Main</a></li>
        <li><a href="options.html">Options</a></li>
        <li><a href="activity.html">Activity</a></li>
        <li><a href="friendlist.html">Friend List</a></li>
        <li><a href="classes.html">Classes</a></li>
    </menu>
    <main>
        <div id="userInfo">
            <!-- skal vise brukeren sitt navn, epost og id -->
        </div>

        <div id="deleteUserForm">
            <p><a href="deleteUser.html">Delete User</a></p>
            <!-- <form>
                
            </form> -->
        </div>

        <div>
            <button onclick="logout()">Logout</button>
        </div>

        <div>
            <!-- skal være en logout funksjon (kanskje et popup vindu?) -->
        </div>
    </main>
    <footer></footer>
</body>
</html>
```

### options.js

```js
async function logout() {
    const response = await fetch("/logout", {
        method: "POST"
    });

    if (response.ok) {
        alert("You are logged out.");
        window.location.href = "/";
    } else {
        alert("Something went wrong");
    }
}

// async funksjon (venter med å skjøre før alt er klart)
async function userInfo() {
    // finner et element med en id
    const userInfoDiv = document.querySelector("#userInfo");
    try {
        // bruker en rute fra backend
        const response = await fetch("/userInfo");
        if (!response.ok) {
            throw new Error("Could not get info. Are you logged in?");
        }
        // venter på at svaret fra serveren, skal bli omgjort fra JSON-format til et JavaScript-objekt, og lagrer det i variabelen (user)
        const user = await response.json();

        // lager et div element hvor info-en skal stå
        const card = document.createElement("div");
        card.classList.add('userCard');

        const info = document.createElement("h1")
        info.textContent = "User info:"
        card.appendChild(info)

        const fullname = document.createElement("p");
        // kombinerer verdiene firstname og lastname slik at den viser begge to samtidig
        fullname.textContent = `Fullname: ${user.firstname} ${user.lastname}`;
        card.appendChild(fullname);

        const email = document.createElement("p");
        email.textContent = `Email: ${user.email}`;
        card.appendChild(email);

        const tlfNumber = document.createElement("p");
        tlfNumber.textContent = `Phone: ${user.tlfNumber}`;
        card.appendChild(tlfNumber);

        const userId = document.createElement("p");
        userId.textContent = `User ID: ${user.id}`;
        card.appendChild(userId);

        userInfoDiv.innerHTML = ""; // Clear previous content
        // legger inn all info-en som den har hentet
        userInfoDiv.appendChild(card);
    } catch (error) {
        console.error("Error:", error);
        userInfoDiv.innerHTML = "<p>Could not load user information. Are you logged in?</p>";
    }
}

// Call the function when page loads
document.addEventListener("DOMContentLoaded", userInfo);
```

---

### deleteUser.html

``` html

```

### deleteUser.js

## activity

### activity.html

``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="style.css">
    <script src="activity.js" defer></script>
</head>
<body>
    <!-- semantisk html -->
    <header><h1>Aktivitet</h1></header>
    <menu>
        <li><a href="index2.html">Main</a></li>
        <li><a href="options.html">Options</a></li>
        <li><a href="activity.html">Activity</a></li>
        <li><a href="friendlist.html">Friend List</a></li>
        <li><a href="classes.html">Classes</a></li>
    </menu>
    <main>
        <form onsubmit="addActivity(event)">
            <label for="activity">Activity</label>
            <select name="activity" id="activity" required>
                <option value="" disabled selected>Select activity</option>
                <option value="Running">Running</option>
                <option value="Cycling">Cycling</option>
                <option value="Swimming">swimming</option>
            </select>
            
            <label for="date">Date</label>
            <input type="date" id="date" required>

            <label for="duration">Duration (min)</label>
            <input type="number" min="0" id="duration" required>

            <button type="submit">Submit</button>
        </form>

        <div id="activities-list"></div>

        <div>
            <h2>Training This Week</h2>
            <!-- tabellen fra chart.js -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="previousWeek()" style="padding: 8px 15px;">← Previous Week</button>
                <span id="weekDisplay" style="font-weight: bold;"></span>
                <button onclick="nextWeek()" style="padding: 8px 15px;">Next Week →</button>
            </div>
            <canvas id="myChart"></canvas>
        </div>
    </main>
    <footer>

    </footer>

<!-- laster inn js-bibliotek fra chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</body>
</html>
```

### activity.js

```js
let currentWeekOffset = 0; // 0 = this week, -1 = last week, +1 = next week
let trainingChart = null;

// funksjon for å legge til aktivitet
async function addActivity(event) {
    event.preventDefault();

    const activity = document.getElementById("activity").value;
    const date = document.getElementById("date").value;
    const duration = document.getElementById("duration").value;

    try {
        const response = await fetch("/addActivity", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                activity,
                date,
                duration
            })
        })
        const result = await response.json();
        alert(result.message);
        // kjører en funksjon
        loadActivities();

        // kjører en funksjon
        // oppdaterer chart-et slik at den viser info om treningen din
        updateChart(); // Update the chart when new activity is added

        // tømmer input-feltene slik at de er klare for å li lagt til ny data
        document.getElementById("activity").value = "";
        document.getElementById("date").value = "";
        document.getElementById("duration").value = "";
    } catch (error) {
        console.error("AddActivityToList error:", error);
        alert("Feil: " + error.message);
    }
}

// viser aktivitetene dine
async function loadActivities() {
    try {
        // gjør et api-kall i app.js
        const response = await fetch("/showYourActivity");
        // konverterer svaret til json
        const activities = await response.json();
        
        // lager html-en
        let html = "<h2>Your Activities</h2>";
        // hvis ingen aktiviteter, vil den vise ingen ting
        if (activities.length === 0) {
            html += "<p>No activities yet</p>";
        // for hver aktivitet vil den lage en "ul" og "li", den henter deretter info fra json-filen
        } else {
            html += "<ul>";
            activities.forEach(act => {
                html += `<li>${act.activity} - ${act.date} (${act.duration} min)</li>`;
            });
            html += "</ul>";
        }
        // finner en id og setter deretter infoen du har laget i html-filen
        const div = document.getElementById("activities-list");
        if (div) {
            div.innerHTML = html;
        }
    } catch (error) {
        console.error("Error loading activities:", error);
    }
}

// Get the start and end date of a specific week
// Finner start (mandag) og slutt (søndag) for en gitt uke
function getWeekDateRange(offset = 0) {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday...
    
    // Calculate Monday of current week
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));

    // new*
    monday.setHours(0, 0, 0, 0);
    
    // Apply week offset
    monday.setDate(monday.getDate() + offset * 7);
    
    // Create Sunday of same week
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    // new*
    sunday.setHours(23, 59, 59, 999);
    
    return { monday, sunday };
}

// Update the week display text
// Oppdaterer teksten som viser hvilken uke som er valgt
function updateWeekDisplay() {
    const { monday, sunday } = getWeekDateRange(currentWeekOffset);
    const mondayStr = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const sundayStr = sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    document.getElementById("weekDisplay").textContent = `${mondayStr} - ${sundayStr}`;
}

// Navigate to previous week
// Går til forrige uke og oppdaterer visning og graf
function previousWeek() {
    currentWeekOffset--;
    updateWeekDisplay();
    updateChart();
}

// Navigate to next week
// Går til neste uke og oppdaterer visning og graf
function nextWeek() {
    currentWeekOffset++;
    updateWeekDisplay();
    updateChart();
}

// Update the chart with activities for the selected week
// Oppdaterer grafen med aktiviteter for valgt uke
async function updateChart() {
    try {
        const response = await fetch("/showYourActivity");
        const activities = await response.json();
        
        // Get week date range
        const { monday, sunday } = getWeekDateRange(currentWeekOffset);
        
        // Initialize day counts (Monday to Sunday)
        const dayCounts = {
            'Monday': 0,
            'Tuesday': 0,
            'Wednesday': 0,
            'Thursday': 0,
            'Friday': 0,
            'Saturday': 0,
            'Sunday': 0
        };
        
        // Count activities for each day of the week
        activities.forEach(act => {
            // new*
            const actDate = new Date(act.date);
            // const actDate = new Date(act.date + 'T00:00:00');
            
            // Check if activity is in the selected week
            if (actDate >= monday && actDate <= sunday) {
                const dayName = actDate.toLocaleDateString('en-US', { weekday: 'long' });
                if (dayCounts.hasOwnProperty(dayName)) {
                    dayCounts[dayName]++;
                }
            }
        });
        
        const labels = Object.keys(dayCounts);
        const data = Object.values(dayCounts);
        
        // Destroy existing chart if it exists
        if (trainingChart) {
            trainingChart.destroy();
        }
        
        // Create new chart
        const ctx = document.getElementById('myChart');
        trainingChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Workouts per Day',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error updating chart:", error);
    }
}

// Kjøres når siden lastes inn: viser uke, aktiviteter og graf
window.addEventListener("load", () => {
    updateWeekDisplay();
    loadActivities();
    updateChart();
});
```

## GDPR og UU
Dette produktet følger GDPR med at:
- Passord blir kryptert slik at trusselaktører og fremmede ikke kan lese det 
- All info av en bruker blir slettet, ingen ting er igjen

Universell utforming (UU) sikrer at produkter, tjenester og digitale løsninger kan brukes av alle mennesker, uavhengig av funksjonsevne. Dette produktet følger UU med å:
- Mobilfunksjonalitet er på plass
- Semantisk HTML for å lage struktur i koden

