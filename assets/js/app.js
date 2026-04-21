
// ===============================
// FIREBASE INIT
// ===============================
// IMPORTANT:
// if this fails, EVERYTHING below will break silently
const firebaseConfig = {
  apiKey: "SECRETT",
  authDomain: "ojttracking-2d004.firebaseapp.com",
  projectId: "ojttracking-2d004",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// ===============================
// AUTH UI TOGGLE (LOGIN / SIGNUP)
// ===============================
// simple UI switch between forms (no backend logic here)

document.getElementById("showSignUp")?.addEventListener("click", () => {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signUpForm").style.display = "block";
});

document.getElementById("showLogin")?.addEventListener("click", () => {
  document.getElementById("signUpForm").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
});


// ===============================
// SIGN UP FLOW
// ===============================
// creates user document in Firestore + stores session locally

document.getElementById("signUpBtn")?.addEventListener("click", async () => {

  const fullName = document.getElementById("fullName").value.trim();
  const username = document.getElementById("signUpUsername").value.trim();
  const email = document.getElementById("signUpEmail").value.trim();
  const studentId = document.getElementById("signUpStudentId").value.trim();

  if (!fullName || !username || !email || !studentId)
    return alert("Fill all fields");

  // IMPORTANT:
  // username uniqueness check (basic but works for student app scale)
  const existing = await db.collection("users")
    .where("username", "==", username)
    .get();

  if (!existing.empty) return alert("Username taken");

  const userRef = await db.collection("users").add({
    full_name: fullName,
    username,
    email,
    student_id: studentId,
    ojt_location: "",
    ojt_address: "",
    target_hours: 0
  });

  localStorage.setItem("userDocId", userRef.id);
  localStorage.setItem("loggedIn", "true");

  window.location.href = "./homepage.html";
});


// ===============================
// LOGIN FLOW
// ===============================
// matches username + student ID (simple auth system)

document.getElementById("loginBtn")?.addEventListener("click", async () => {

  const username = document.getElementById("loginUsername").value.trim();
  const studentId = document.getElementById("loginStudentId").value.trim();

  if (!username || !studentId)
    return alert("Fill all fields");

  const query = await db.collection("users")
    .where("username", "==", username)
    .where("student_id", "==", studentId)
    .get();

  if (query.empty) return alert("Invalid login");

  localStorage.setItem("userDocId", query.docs[0].id);
  localStorage.setItem("loggedIn", "true");

  window.location.href = "./homepage.html";
});


// ===============================
// TIME HELPERS
// ===============================
// converts "HH:MM" → decimal hours

function safeParseTime(t) {
  if (!t) return NaN;
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
}


// ===============================
// LOGBOOK LOADER
// ===============================
// renders attendance table + supports filtering by month/year

async function loadLogbook(month = null, year = null) {

  const userDocId = localStorage.getItem("userDocId");

  const snapshot = await db.collection("users")
    .doc(userDocId)
    .collection("ojt_records")
    .orderBy("date", "asc")
    .get();

  const tbody = document.getElementById("logTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  let hasRecords = false;

  snapshot.forEach(doc => {

    const d = doc.data();

    const recordDate = new Date(d.date);
    const recordMonth = recordDate.getMonth() + 1;
    const recordYear = recordDate.getFullYear();

    if (month && year) {
      if (recordMonth !== month || recordYear !== year) return;
    }

    hasRecords = true;

    const statusRaw = (d.status || "").toLowerCase();

    const isEmptyTime =
      !d.am_in && !d.am_out &&
      !d.pm_in && !d.pm_out;

    const isAbsent = statusRaw === "absent" || isEmptyTime;
    const isHalf = statusRaw.includes("half") || (!isEmptyTime && (!d.am_in || !d.pm_in));

    const am = (d.am_in && d.am_out)
      ? safeParseTime(d.am_out) - safeParseTime(d.am_in)
      : 0;

    const pm = (d.pm_in && d.pm_out)
      ? safeParseTime(d.pm_out) - safeParseTime(d.pm_in)
      : 0;

    const total = isAbsent ? "Absent" : (am + pm).toFixed(2);

    const row = document.createElement("tr");

    if (isAbsent) row.classList.add("absent-row");
    else if (isHalf) row.classList.add("halfday-row");

    row.innerHTML = `
      <td>${d.date}</td>
      <td>${d.am_in || "-"}</td>
      <td>${d.am_out || "-"}</td>
      <td>${d.pm_in || "-"}</td>
      <td>${d.pm_out || "-"}</td>
      <td>${total}</td>
      <td>
        <button onclick="deleteLog('${doc.id}')" class="danger">Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  });

  if (!hasRecords) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="padding:15px;text-align:center;color:#888;">
          No record for this month
        </td>
      </tr>
    `;
  }
}


// ===============================
// DELETE LOG
// ===============================
// removes single attendance record

async function deleteLog(logId) {

  const confirmDelete = confirm("Delete this log entry?");
  if (!confirmDelete) return;

  const userDocId = localStorage.getItem("userDocId");

  await db.collection("users")
    .doc(userDocId)
    .collection("ojt_records")
    .doc(logId)
    .delete();

  alert("Log deleted!");
}


// ===============================
// ABSENT MARKER
// ===============================
// quick insert for absent days

document.getElementById("absentBtn")?.addEventListener("click", async () => {

  const logDateInput = document.getElementById("logDate");

  let date = logDateInput.value;

  if (!date) {
    date = new Date().toISOString().split("T")[0];
    logDateInput.value = date;
  }

  const userDocId = localStorage.getItem("userDocId");

  await db.collection("users")
    .doc(userDocId)
    .collection("ojt_records")
    .add({
      date,
      am_in: "",
      am_out: "",
      pm_in: "",
      pm_out: "",
      status: "Absent"
    });

  alert("Marked Absent!");
});


// ===============================
// SAVE FULL DAY
// ===============================
// stores complete attendance record

document.getElementById("saveLogBtn")?.addEventListener("click", async () => {

  const date = document.getElementById("logDate").value;

  if (!date) return alert("Please select a date");

  const userDocId = localStorage.getItem("userDocId");

  await db.collection("users")
    .doc(userDocId)
    .collection("ojt_records")
    .add({
      date,
      am_in: document.getElementById("amIn").value || "",
      am_out: document.getElementById("amOut").value || "",
      pm_in: document.getElementById("pmIn").value || "",
      pm_out: document.getElementById("pmOut").value || "",
      status: "Present"
    });

  alert("Saved!");

  const today = new Date();
  loadLogbook(today.getMonth() + 1, today.getFullYear());
});


// ===============================
// HALF DAY SYSTEM
// ===============================
// splits AM / PM half-day logic

async function saveHalfDay(type) {

  const date = document.getElementById("logDate").value;
  if (!date) return alert("Please select a date");

  const userDocId = localStorage.getItem("userDocId");

  let data;

  if (type === "AM") {
    data = {
      date,
      am_in: "08:00",
      am_out: "12:00",
      pm_in: "",
      pm_out: "",
      status: "Half Day (AM)"
    };
  } else {
    data = {
      date,
      am_in: "",
      am_out: "",
      pm_in: "13:00",
      pm_out: "17:00",
      status: "Half Day (PM)"
    };
  }

  await db.collection("users")
    .doc(userDocId)
    .collection("ojt_records")
    .add(data);

  document.getElementById("halfDayPopup").style.display = "none";

  alert("Half Day saved!");
  loadLogbook();
}


// ===============================
// INITIAL LOAD
// ===============================
// sets default date + loads table

window.addEventListener("load", () => {

  const today = new Date();

  const dateInput = document.getElementById("logDate");
  if (dateInput) {
    dateInput.value = today.toISOString().split("T")[0];
  }

  loadLogbook(today.getMonth() + 1, today.getFullYear());
});


// ===============================
// DASHBOARD GREETING
// ===============================
// updates user info + remaining hours

async function updateGreetingCard() {

  const userDocId = localStorage.getItem("userDocId");
  if (!userDocId) return;

  const doc = await db.collection("users").doc(userDocId).get();
  if (!doc.exists) return;

  const data = doc.data();

  document.getElementById("greeting").textContent =
    `Hello, ${data.username || "User"}!`;

  document.getElementById("companyName").textContent =
    data.ojt_location || "No Company Set";

  const target = Number(data.target_hours || 0);

  const snapshot = await db.collection("users")
    .doc(userDocId)
    .collection("ojt_records")
    .get();

  let total = 0;

  snapshot.forEach(doc => {

    const d = doc.data();

    if (d.status !== "Absent") {
      const am = (d.am_in && d.am_out)
        ? parseFloat(d.am_out) - parseFloat(d.am_in)
        : 0;

      const pm = (d.pm_in && d.pm_out)
        ? parseFloat(d.pm_out) - parseFloat(d.pm_in)
        : 0;

      total += am + pm;
    }
  });

  const remaining = Math.max(target - total, 0);

  document.getElementById("remainingHours").textContent =
    `${remaining.toFixed(2)}h Remaining`;
}


// ===============================
// TOTAL HOURS CALC
// ===============================
// reusable helper for dashboards + charts

async function getTotalRecordedHours(userDocId) {

  const snapshot = await db.collection("users")
    .doc(userDocId)
    .collection("ojt_records")
    .get();

  let total = 0;
  let absentCount = 0;

  snapshot.forEach(doc => {

    const d = doc.data();

    if (d.status === "Absent") {
      absentCount++;
      return;
    }

    const am = (d.am_in && d.am_out)
      ? safeParseTime(d.am_out) - safeParseTime(d.am_in)
      : 0;

    const pm = (d.pm_in && d.pm_out)
      ? safeParseTime(d.pm_out) - safeParseTime(d.pm_in)
      : 0;

    total += am + pm;
  });

  return { total, absentCount };
}