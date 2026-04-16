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
    } catch (error) {
        console.error("AddActivityToList error:", error);
        alert("Feil: " + error.message);
    }

}