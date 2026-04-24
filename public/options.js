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