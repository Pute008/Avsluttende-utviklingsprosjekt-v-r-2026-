// this is for index2.html

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
            notes.textContent = classItem.notes;
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