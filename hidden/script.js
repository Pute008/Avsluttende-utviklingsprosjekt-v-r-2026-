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

document.getElementById("DOMContentLoaded", async () => {
    const tabellBody = document.querySelector("#classList");
    try {
        const response = await fetch("/showAllClasses")
        if (!response.ok) {
            throw new Error("Could not get the Games. Are you logged inn?");
        }

        const classes = await response.json();

        classes.forEach(classes => {
            const rad = document.createElement("div");
            rad.classList.add('class');

            const title = document.createElement("h1");
            title.textContent = classes.title;
            rad.appendChild(title);

            if (game.image) {
                const link = document.createElement('a');
                link.href = `game.html?id=${game.IDgame}`;
                console.log(link)

                const img = document.createElement('img');
                img.src = "/picture/" + game.image;
                img.alt = game.gameName;
                img.style.cursor = 'pointer';

                link.appendChild(img);
                rad.appendChild(link);
            };

            tabellBody.appendChild(rad);
        });
    } catch (error) {
        console.error("Fail:", error);
        tabellBody.innerHTML = `<tr><td colspan="3">Could not get the games: ${error.message}</td></tr>`;
    }
})