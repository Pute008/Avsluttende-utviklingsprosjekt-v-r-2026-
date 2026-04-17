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
        loadActivities();
    } catch (error) {
        console.error("AddActivityToList error:", error);
        alert("Feil: " + error.message);
    }
}

async function loadActivities() {
    try {
        const response = await fetch("/showYourActivity");
        const activities = await response.json();
        // console.log("Your activities:", activities);
        
        let html = "<h2>Your Activities</h2>";
        if (activities.length === 0) {
            html += "<p>No activities yet</p>";
        } else {
            html += "<ul>";
            activities.forEach(act => {
                html += `<li>${act.activity} - ${act.date} (${act.duration} min)</li>`;
            });
            html += "</ul>";
        }
        
        const div = document.getElementById("activities-list");
        if (div) {
            div.innerHTML = html;
        }
    } catch (error) {
        console.error("Error loading activities:", error);
    }
}

window.addEventListener("load", loadActivities);