async function loginPersonDelete(event) {
    event.preventDefault();
    // console.log("hello world")

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch('/loginDelete', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (response.ok) {
        await deleteUser(email, password);
        // window.location.href = result.redirect;
    } else {
        alert(result.message);
    }
}

async function deleteUser(email, password) {
    // event.preventDefault();
    // const email = document.getElementById("email").value;
    // const password = document.getElementById("password").value;

    const response = await fetch('/deleteUser', {
        method: "DELETE",  // or POST — just match what app.js uses
        headers: { "Content-Type": "application/json" },
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





// async function deleteUser(event) {
//     event.preventDefault();

//     const email = document.getElementById("email").value;
//     const password = document.getElementById("password").value;

//     const response = await fetch('/deleteUser', {
//         method: "DELETE",  // or POST — just match what app.js uses
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password })
//     });

//     const result = await response.json();

//     if (response.ok) {
//         alert(result.message);
//         window.location.href = result.redirect;
//     } else {
//         alert(result.message);
//     }
// }