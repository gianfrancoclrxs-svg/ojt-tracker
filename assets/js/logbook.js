import { db } from "./firebase.js";
import { safeParseTime } from "./utils.js";

// ===============================
// LOGBOOK MODULE (GLOBAL EXPORT)
// ===============================
// IMPORTANT:
// exposed on window because it's called from HTML onclick / inline scripts
window.loadLogbook = async function (month = null, year = null) {

  const userDocId = localStorage.getItem("userDocId");

  // IMPORTANT:
  // no user session = no database query
  if (!userDocId) return;

  const snapshot = await db.collection("users")
    .doc(userDocId)
    .collection("ojt_records")
    .orderBy("date", "asc")
    .get();

  const tbody = document.getElementById("logTableBody");

  if (!tbody) return;

  tbody.innerHTML = "";

  // ===============================
  // RENDER TABLE ROWS
  // ===============================
  snapshot.forEach(doc => {

    const d = doc.data();

    // calculate AM/PM hours safely
    const am = (d.am_in && d.am_out)
      ? safeParseTime(d.am_out) - safeParseTime(d.am_in)
      : 0;

    const pm = (d.pm_in && d.pm_out)
      ? safeParseTime(d.pm_out) - safeParseTime(d.pm_in)
      : 0;

    const total = (am + pm).toFixed(2);

    // IMPORTANT:
    // status overrides computed hours for absent days
    const displayTotal = d.status === "Absent" ? "Absent" : total;

    tbody.innerHTML += `
      <tr>
        <td>${d.date}</td>
        <td>${d.am_in || "-"}</td>
        <td>${d.am_out || "-"}</td>
        <td>${d.pm_in || "-"}</td>
        <td>${d.pm_out || "-"}</td>
        <td>${displayTotal}</td>
        <td>
          <button onclick="deleteLog('${doc.id}')">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
};


// ===============================
// DELETE LOG ENTRY
// ===============================
// IMPORTANT:
// destructive action → always confirm in UI layer if possible
window.deleteLog = async function (id) {

  const userDocId = localStorage.getItem("userDocId");

  if (!userDocId) return;

  await db.collection("users")
    .doc(userDocId)
    .collection("ojt_records")
    .doc(id)
    .delete();

  alert("Deleted");

  // refresh table after deletion
  loadLogbook();
};