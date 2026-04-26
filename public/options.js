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