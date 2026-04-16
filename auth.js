// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDWaXBAuxdN4WvXK62x-qIQEMCEe1-qs40",
  authDomain: "health-monitor-3223b.firebaseapp.com",
  databaseURL: "https://health-monitor-3223b-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// ✅ INIT
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

// 📢 MESSAGE
function showMsg(msg, color = "white") {
  const el = document.getElementById("msg");
  el.innerText = msg;
  el.style.color = color;
}

// 🔐 LOGIN
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showMsg("Please enter email & password", "red");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      showMsg("Login Successful ✅", "lightgreen");
      setTimeout(() => window.location.href = "index.html", 800);
    })
    .catch((error) => {
      console.error(error);
      showMsg("Incorrect Email or Password ❌", "red");
    });
}

// 🆕 SIGNUP (FIXED)
function signup() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showMsg("Enter email & password first", "red");
    return;
  }

  const name = prompt("Enter your name:");
  const phone = prompt("Enter your phone:");

  if (!name || !phone) {
    showMsg("Signup cancelled ❌", "red");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((cred) => {

      // ✅ SAVE USER DATA
      return db.ref("users/" + cred.user.uid).set({
        name: name,
        phone: phone,
        email: email
      });

    })
    .then(() => {
      showMsg("Account Created Successfully ✅", "lightgreen");

      // 🔁 Move back to login state
      setTimeout(() => {
        auth.signOut();
      }, 1000);
    })
    .catch((error) => {
      console.error(error);
      showMsg(error.message, "red");
    });
}

// 🔑 FORGOT PASSWORD (FIXED)
function forgotPassword() {
  const email = document.getElementById("email").value.trim();

  if (!email) {
    showMsg("Enter your email first", "red");
    return;
  }

  auth.sendPasswordResetEmail(email)
    .then(() => {
      showMsg("Reset link sent to your email 📩", "lightgreen");
    })
    .catch((error) => {
      console.error(error);
      showMsg("Error: " + error.message, "red");
    });
}

// 🔵 GOOGLE LOGIN
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithRedirect(provider)
    .then((result) => {
      const user = result.user;

      // ✅ SAVE USER IF NEW
      db.ref("users/" + user.uid).once("value")
        .then((snap) => {

          if (!snap.exists()) {
            return db.ref("users/" + user.uid).set({
              name: user.displayName,
              email: user.email,
              phone: user.phoneNumber || "N/A"
            });
          }

        })
        .then(() => {
          showMsg("Google Login Successful ✅", "lightgreen");

          setTimeout(() => {
            window.location.href = "index.html";
          }, 800);
        });

    })
    .catch((error) => {
      console.error(error);
      showMsg("Google Login Failed ❌", "red");
    });
}
