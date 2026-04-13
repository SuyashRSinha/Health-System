// 🔥 Firebase Config
var firebaseConfig = {
  apiKey: "AIzaSyDWaXBAuxdN4WvXK62x-qIQEMCEe1-qs40",
  databaseURL: "https://health-monitor-3223b-default-rtdb.asia-southeast1.firebasedatabase.app"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.database();

// 📊 CHART VARIABLES
let hrChart, tempChart, spo2Chart, glucoseChart;

function createChart(id, label) {
  return new Chart(document.getElementById(id).getContext("2d"), {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: label,
        data: [],
        borderWidth: 2,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

window.onload = function () {
  hrChart = createChart("hrChart", "Heart Rate");
  tempChart = createChart("tempChart", "Temperature");
  spo2Chart = createChart("spo2Chart", "SpO2");
  glucoseChart = createChart("glucoseChart", "Glucose");
};

db.ref("health").on("value", function(snapshot) {
  let data = snapshot.val();
  if (!data) return;

  document.getElementById("hr").innerText = (data.heartRate || 0) + " BPM";
  document.getElementById("temp").innerText = (data.temperature || 0) + " °C";
  document.getElementById("spo2").innerText = (data.spo2 || 0) + " %";
  document.getElementById("glucose").innerText = (data.glucose || 0) + " mg/dL";
});

// =======================
// 📊 HISTORY DATA
// =======================
db.ref("history").on("value", function(snapshot) {
  let data = snapshot.val();
  if (!data) return;

  let labels = [];
  let hrData = [];
  let tempData = [];
  let spo2Data = [];
  let glucoseData = [];

  Object.entries(data).forEach(([key, entry]) => {
    if (!entry) return;

    labels.push(key);
    hrData.push(entry.heartRate || 0);
    tempData.push(entry.temperature || 0);
    spo2Data.push(entry.spo2 || 0);
    glucoseData.push(entry.glucose || 0);
  });

  updateChart(hrChart, labels, hrData);
  updateChart(tempChart, labels, tempData);
  updateChart(spo2Chart, labels, spo2Data);
  updateChart(glucoseChart, labels, glucoseData);
});

// =======================
// 🔄 UPDATE CHART
// =======================
function updateChart(chart, labels, data) {
  if (!chart) return;

  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}