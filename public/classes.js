
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

            const instructor = document.createElement("p")
            instructor.textContent = classItem.instructor;
            rad.appendChild(instructor);

            const maxParticipants = document.createElement("p")
            maxParticipants.textContent = classItem.maxParticipants;
            rad.appendChild(maxParticipants);

            const timeMinutes = document.createElement("p")
            timeMinutes.textContent = classItem.timeMinutes;
            rad.appendChild(timeMinutes);

            tabellBody.appendChild(rad);
        });
    } catch (error) {
        console.error("Fail:", error);
        tabellBody.innerHTML = `<div>Could not get the classes: ${error.message}</div>`;
    }
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", showClasses);