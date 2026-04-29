const firebaseConfig = {
  apiKey: "SECRETT",
  authDomain: "ojttracking-2d004.firebaseapp.com",
  projectId: "ojttracking-2d004",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

function getDayName(dateString) {
  const days = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
  return days[new Date(dateString).getDay()];
}

function getMonthName(monthNumber) {
  return ["January","February","March","April","May","June","July","August","September","October","November","December"][monthNumber - 1];
}

function formatTo12Hour(time) {
  if (!time) return "";

  const [hourStr, minute] = time.split(":");
  let hour = parseInt(hourStr, 10);

  hour = hour % 12 || 12;

  return `${hour}:${minute}`;
}

async function loadDTR(month, year) {
  try {
    const userDocId = localStorage.getItem("userDocId");
    if (!userDocId) {
      alert("User not found");
      return;
    }

    const userDoc = await db.collection("users").doc(userDocId).get();
    const userData = userDoc.data();

    document.getElementById("companyName").textContent = userData?.ojt_location || "";
    document.getElementById("companyAddress").textContent = userData?.ojt_address || "";

    document.querySelector(".underline").textContent = `${getMonthName(month)} ${year}`;

    const snapshot = await db.collection("users")
      .doc(userDocId)
      .collection("ojt_records")
      .get();

    const recordsMap = {};
    snapshot.forEach(doc => {
      const d = doc.data();
      if (d.date) recordsMap[d.date] = d;
    });

    const tbody = document.getElementById("dtrBody");
    tbody.innerHTML = "";

    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      const record = recordsMap[dateStr];

      const hasRecord =
        record &&
        record.status !== "Absent" &&
        (record.am_in || record.am_out || record.pm_in || record.pm_out);

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${day}</td>
        <td>${hasRecord ? getDayName(dateStr) : ""}</td>
        <td>${hasRecord ? formatTo12Hour(record.am_in) : ""}</td>
        <td>${hasRecord ? formatTo12Hour(record.am_out) : ""}</td>
        <td>${hasRecord ? formatTo12Hour(record.pm_in) : ""}</td>
        <td>${hasRecord ? formatTo12Hour(record.pm_out) : ""}</td>
        <td></td>
      `;

      tbody.appendChild(row);
    }
  
    setTimeout(() => {
      window.print();
    }, 1000);

  } catch (error) {
    console.error("Error loading DTR:", error);
    alert("Failed to load DTR data");
  }
}

const urlParams = new URLSearchParams(window.location.search);
const month = parseInt(urlParams.get("month"));
const year = parseInt(urlParams.get("year"));

const finalMonth = month || new Date().getMonth() + 1;
const finalYear = year || new Date().getFullYear();

loadDTR(finalMonth, finalYear);