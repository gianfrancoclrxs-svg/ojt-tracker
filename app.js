// app.js
const firebaseConfig = {
    apiKey: "SECRETT",
    authDomain: "ojttracking-2d004.firebaseapp.com",
    projectId: "ojttracking-2d004",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Toggle between login/signup forms
document.getElementById("showSignUp")?.addEventListener("click", () => {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signUpForm").style.display = "block";
});
document.getElementById("showLogin")?.addEventListener("click", () => {
  document.getElementById("signUpForm").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
});

// Sign Up
document.getElementById("signUpBtn")?.addEventListener("click", async () => {
  const fullName = document.getElementById("fullName").value.trim();
  const username = document.getElementById("signUpUsername").value.trim();
  const email = document.getElementById("signUpEmail").value.trim();
  const studentId = document.getElementById("signUpStudentId").value.trim();
  if (!fullName || !username || !email || !studentId) return alert("Fill all fields");

  const existing = await db.collection("users").where("username", "==", username).get();
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
  window.location.href = "homepage.html";
});

// Login
document.getElementById("loginBtn")?.addEventListener("click", async () => {
  const username = document.getElementById("loginUsername").value.trim();
  const studentId = document.getElementById("loginStudentId").value.trim();
  if (!username || !studentId) return alert("Fill all fields");

  const query = await db.collection("users")
    .where("username", "==", username)
    .where("student_id", "==", studentId)
    .get();
  if (query.empty) return alert("Invalid login");

  localStorage.setItem("userDocId", query.docs[0].id);
  localStorage.setItem("loggedIn", "true");
  window.location.href = "homepage.html";
});

// Helper to parse "hh:mm" into hours
function safeParseTime(t) {
  if (!t) return NaN;
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
}

// ✅ Your working getTotalRecordedHours()
async function getTotalRecordedHours(userDocId) {
    const snapshot = await db.collection("users")
        .doc(userDocId)
        .collection("ojt_records")
        .get();

    let total = 0;
    let absentCount = 0;

    snapshot.forEach(doc => {
        const d = doc.data();
        const am = safeParseTime(d.am_out) - safeParseTime(d.am_in);
        const pm = safeParseTime(d.pm_out) - safeParseTime(d.pm_in);

        const dayTotal = am + pm;

        if (isNaN(dayTotal)) {
            absentCount++;
        } else {
            total += dayTotal;
        }
    });

    return { total, absentCount };
}

// Update homepage greeting & remaining hours
async function updateGreetingCard() {
  const userDocId = localStorage.getItem("userDocId");
  if (!userDocId) return;

  const userDoc = await db.collection("users").doc(userDocId).get();
  const data = userDoc.data();

  document.getElementById("greeting").textContent = `Hello, ${data.username}!`;

  if (!data.ojt_location || !data.ojt_address || !data.target_hours) {
    document.getElementById("ojtPopup").style.display = "flex";
    document.getElementById("ojtInfo").style.display = "none";

    document.getElementById("ojtCompanyName").value = data.ojt_location || "";
    document.getElementById("ojtAddress").value = data.ojt_address || "";
    document.getElementById("targetHours").value = data.target_hours || "";
    return;
  }

  document.getElementById("ojtPopup").style.display = "none";
  document.getElementById("ojtInfo").style.display = "block";

  document.getElementById("companyName").textContent = data.ojt_location;

  // After getting userDoc and calling getTotalRecordedHours()
  const { total } = await getTotalRecordedHours(userDocId);
  const targetHours = data.target_hours || 0;

  const remaining = targetHours - total;

  // Display with 2 decimals
  document.getElementById("remainingHours").textContent = `${remaining.toFixed(2)}h Remaining`;
}

// Save OJT info
document.getElementById("saveOjtBtn")?.addEventListener("click", async () => {
  const loc = document.getElementById("ojtCompanyName").value.trim();
  const addr = document.getElementById("ojtAddress").value.trim();
  const target = parseFloat(document.getElementById("targetHours").value);

  if (!loc || !addr || !target) return alert("Fill all fields");

  const userDocId = localStorage.getItem("userDocId");

  await db.collection("users").doc(userDocId).update({
    ojt_location: loc,
    ojt_address: addr,
    target_hours: target
  });

  updateGreetingCard();
});

// Save log entry
document.getElementById("saveLogBtn")?.addEventListener("click", async () => {
  const date = document.getElementById("logDate").value;
  const am_in = document.getElementById("amIn").value;
  const am_out = document.getElementById("amOut").value;
  const pm_in = document.getElementById("pmIn").value;
  const pm_out = document.getElementById("pmOut").value;
  if (!date || !am_in || !am_out || !pm_in || !pm_out) return alert("Fill all fields");

  const userDocId = localStorage.getItem("userDocId");
  await db.collection("users").doc(userDocId).collection("ojt_records").add({date, am_in, am_out, pm_in, pm_out});
  alert("Log saved!");
  loadLogbook();
  updateGreetingCard();
});

// Load logbook
async function loadLogbook() {
  const userDocId = localStorage.getItem("userDocId");
  const snapshot = await db.collection("users")
    .doc(userDocId)
    .collection("ojt_records")
    .orderBy("date", "asc")
    .get();

  const tbody = document.getElementById("logTableBody");
  tbody.innerHTML = "";

  let overallTotal = 0;

  snapshot.forEach(doc => {
    const d = doc.data();
    const am = safeParseTime(d.am_out) - safeParseTime(d.am_in);
    const pm = safeParseTime(d.pm_out) - safeParseTime(d.pm_in);

    const isAbsent = isNaN(am + pm);
    const total = isAbsent ? "Absent" : (am + pm).toFixed(2);

    if (!isAbsent) overallTotal += (am + pm);

    const row = document.createElement("tr");
    if (isAbsent) row.style.backgroundColor = "#fdd"; 

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

  localStorage.setItem("overallTotalHours", overallTotal);
}

// Delete log
async function deleteLog(logId) {
  const confirmDelete = confirm("Delete this log entry?");
  if (!confirmDelete) return;

  const userDocId = localStorage.getItem("userDocId");
  try {
    await db.collection("users").doc(userDocId).collection("ojt_records").doc(logId).delete();
    alert("Log deleted!");
    loadLogbook();
    updateGreetingCard();
  } catch (error) {
    console.error(error);
    alert("Error deleting log");
  }
}

// Mark absent
document.getElementById("absentBtn")?.addEventListener("click", async () => {
  const logDateInput = document.getElementById("logDate");
  let date = logDateInput.value;
  if (!date) {
    const today = new Date();
    date = today.toISOString().split("T")[0];
    logDateInput.value = date;
  }

  const userDocId = localStorage.getItem("userDocId");
  if (!userDocId) return alert("User not found");

  try {
    await db.collection("users").doc(userDocId).collection("ojt_records").add({
      date,
      am_in: "",
      am_out: "",
      pm_in: "",
      pm_out: "",
      status: "Absent"
    });
    alert(`Marked ${date} as Absent!`);
    loadLogbook();
    updateGreetingCard();
  } catch (err) {
    console.error(err);
    alert("Error marking absent");
  }
});