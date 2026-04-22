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

            // const instructor = document.createElement("p")
            // instructor.textContent = classItem.instructor;
            // rad.appendChild(instructor);

            const fullName = document.createElement("p");
            fullName.textContent = `Instructor: ${classItem.firstname} ${classItem.lastname}`;
            rad.appendChild(fullName);

            const maxParticipants = document.createElement("p")
            maxParticipants.textContent = "Max Participants: " + classItem.maxParticipants;
            rad.appendChild(maxParticipants);

            const timeMinutes = document.createElement("p")
            timeMinutes.textContent = "Duration (minutes): " + classItem.timeMinutes;
            rad.appendChild(timeMinutes);

            // knapp som kommer opp
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

async function userInfo() {
    const userInfoDiv = document.querySelector("#userInfo");
    try {
        const response = await fetch("/userInfo");
        if (!response.ok) {
            throw new Error("Could not get info. Are you logged in?");
        }
        const user = await response.json();

        // Create user info card
        const card = document.createElement("div");
        card.classList.add('userCard');

        const info = document.createElement("h1")
        info.textContent = "User info:"
        card.appendChild(info)

        const fullname = document.createElement("p");
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
        userInfoDiv.appendChild(card);
    } catch (error) {
        console.error("Error:", error);
        userInfoDiv.innerHTML = "<p>Could not load user information. Are you logged in?</p>";
    }
}

// Call the function when page loads
document.addEventListener("DOMContentLoaded", userInfo);