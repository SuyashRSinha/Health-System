const firebaseConfig = {
  apiKey: "AIzaSyDWaXBAuxdN4WvXK62x-qIQEMCEe1-qs40",
  authDomain: "health-monitor-3223b.firebaseapp.com",
  databaseURL: "https://health-monitor-3223b-default-rtdb.asia-southeast1.firebasedatabase.app"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

let hrChart, tempChart, spo2Chart, glucoseChart;
let currentUID = null;

window.onload = () => {
  hrChart = createChart("hrChart", "Heart Rate");
  tempChart = createChart("tempChart", "Temperature");
  spo2Chart = createChart("spo2Chart", "SpO2");
  glucoseChart = createChart("glucoseChart", "Glucose");
};

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
        x: { ticks: { color: "white" } },
        y: { ticks: { color: "white" } }
      }
    }
  });
}

document.body.style.display = "none";

auth.onAuthStateChanged((user) => {

  if (user) {
    currentUID = user.uid;

    console.log("✅ Logged in UID:", currentUID);

    document.body.style.display = "block";

    loadUserData(currentUID);

  } else {
    setTimeout(() => {
      window.location.href = "login.html";
    }, 800);
  }
});

function loadUserData(uid) {

  db.ref("users/" + uid).once("value")
    .then((snap) => {
      const data = snap.val();

      document.getElementById("username").innerText =
        data?.name || "User";
    });
  db.ref("users/" + uid + "/health").on("value", snap => {
    const d = snap.val();
    if (!d) return;

    document.getElementById("hr").innerText = d.heartRate + " BPM";
    document.getElementById("temp").innerText = d.temperature + " °C";
    document.getElementById("spo2").innerText = d.spo2 + " %";
    document.getElementById("glucose").innerText = d.glucose + " mg/dL";
  });

  db.ref("users/" + uid + "/history").on("value", snap => {
    const data = snap.val();
    if (!data) return;

    const labels = [];
    const hrData = [], tempData = [], spo2Data = [], glucoseData = [];

    Object.values(data).forEach((item, i) => {
      labels.push(i + 1);
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

function updateChart(chart, labels, data) {
  if (!chart) return;

  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

function logout() {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
}
