function registerUser() {
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;
  const email = document.getElementById("reg-email").value;

  if (!username || !password) {
    alert("Please fill all fields.");
    return;
  }

  // save user to local storage
  const user = JSON.parse(localStorage.getItem("revizio-users")) || {};
  if (user[username]) {
    alert("User already exists!");
    return;
  }

  user[username] = { password };
  localStorage.setItem("revizio-users", JSON.stringify(user));
  alert("Registration successful!");
  window.location.href = "login.html";
}

// LOGIN
function loginUser() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  const users = JSON.parse(localStorage.getItem("revizio-users")) || {};
  if (!users[username] || users[username].password !== password) {
    alert("Invalid credentials.");
    return;
  }

  //save login state
  localStorage.setItem("revizio-current-user", username);
  alert("Login successful!");
  window.location.href = "dashboard.html";
}

function loginAsGuest() {
  let users = JSON.parse(localStorage.getItem("revizio-users")) || {};

  if (!users["guest"]) {
    password: "demo";
    users["guest"] = {
      topics: [],
    };
    localStorage.setItem("revizio-users", JSON.stringify(users));
  }

  localStorage.setItem("revizio-current-user", "guest");
  alert("Logged in as guest!");
  window.location.href = "dashboard.html";
}
