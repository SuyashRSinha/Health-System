auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDWaXBAuxdN4WvXK62x-qIQEMCEe1-qs40",
  authDomain: "health-monitor-3223b.firebaseapp.com",
  databaseURL: "https://health-monitor-3223b-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// ✅ INIT FIREBASE
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

// 🌍 GLOBAL VARIABLES
let hrChart, tempChart, spo2Chart, glucoseChart;
let currentUID = null;

// 🚀 INIT CHARTS
window.onload = () => {
  hrChart = createChart("hrChart", "Heart Rate");
  tempChart = createChart("tempChart", "Temperature");
  spo2Chart = createChart("spo2Chart", "SpO2");
  glucoseChart = createChart("glucoseChart", "Glucose");
};

// 📈 CREATE CHART FUNCTION
function createChart(id, label) {
  const ctx = document.getElementById(id);

  if (!ctx) {
    console.error("Canvas not found:", id);
    return null;
  }

  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: label,
        data: [],
        borderWidth: 2,
        tension: 0.4,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          labels: { color: "white" }
        }
      },
      scales: {
        x: {
          ticks: { color: "white" }
        },
        y: {
          ticks: { color: "white" }
        }
      }
    }
  });
}

// 🔐 AUTH STATE CHECK (FINAL FIXED)
let currentUID = null;

// Hide page initially to avoid flicker
document.body.style.display = "none";

auth.onAuthStateChanged((user) => {

  if (user) {
    currentUID = user.uid;

    console.log("✅ Logged in UID:", currentUID);

    // ✅ Show dashboard only AFTER auth confirmed
    document.body.style.display = "block";

    // ✅ Load user-specific data
    loadUserData(currentUID);

  } else {
    console.log("❌ No user found → redirecting");

    // ⏳ Delay prevents instant flicker
    setTimeout(() => {
      window.location.href = "login.html";
    }, 800);
  }

});

// 👤 LOAD USER NAME + DATA
function loadUserData(uid) {

  // 🔹 USER INFO
  db.ref("users/" + uid).once("value")
    .then((snap) => {
      const data = snap.val();

      if (data && data.name) {
        document.getElementById("username").innerText = data.name;
      } else {
        document.getElementById("username").innerText = "User";
      }
    });

  // ❤️ LIVE SENSOR DATA
  db.ref("users/" + uid + "/health").on("value", snap => {
    const d = snap.val();
    if (!d) return;

    document.getElementById("hr").innerText = d.heartRate + " BPM";
    document.getElementById("temp").innerText = d.temperature + " °C";
    document.getElementById("spo2").innerText = d.spo2 + " %";
    document.getElementById("glucose").innerText = d.glucose + " mg/dL";
  });

  // 📊 HISTORY DATA (GRAPH)
  db.ref("users/" + uid + "/history").on("value", snap => {
    const data = snap.val();

    if (!data) {
      console.warn("⚠ No history data found");
      return;
    }

    const labels = [];
    const hrData = [];
    const tempData = [];
    const spo2Data = [];
    const glucoseData = [];

    Object.values(data).forEach((item, index) => {
      labels.push(index + 1);

      hrData.push(item.heartRate || 0);
      tempData.push(item.temperature || 0);
      spo2Data.push(item.spo2 || 0);
      glucoseData.push(item.glucose || 0);
    });

    updateChart(hrChart, labels, hrData);
    updateChart(tempChart, labels, tempData);
    updateChart(spo2Chart, labels, spo2Data);
    updateChart(glucoseChart, labels, glucoseData);
  });
}

// 🔄 UPDATE CHART
function updateChart(chart, labels, data) {
  if (!chart) return;

  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

// 🚪 LOGOUT
function logout() {
  auth.signOut()
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error("Logout Error:", error);
    });
}
