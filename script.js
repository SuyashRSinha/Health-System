// Fetch data from ThingSpeak
async function getData() {
  try {
    const response = await fetch("https://api.thingspeak.com/channels/3306909/feeds/last.json");
    const data = await response.json();

    document.getElementById("hr").innerText = data.field1 + " BPM";
    document.getElementById("temp").innerText = data.field2 + " °C";
    document.getElementById("spo2").innerText = data.field3 + " %";
    document.getElementById("ecg").innerText = data.field4;
    document.getElementById("glucose").innerText = data.field5 + " mg/dL";

    document.getElementById("hr").style.color = "#38bdf8";
    document.getElementById("temp").style.color = "#38bdf8";
    document.getElementById("spo2").style.color = "#38bdf8";

    if (data.field1 > 120) {
      document.getElementById("hr").style.color = "red";
    }

    if (data.field2 > 38) {
      document.getElementById("temp").style.color = "orange";
    }

    if (data.field3 < 90) {
      document.getElementById("spo2").style.color = "red";
    }

  } catch (error) {
    console.log("Error fetching data:", error);
  }
}

setInterval(getData, 5000);

getData();