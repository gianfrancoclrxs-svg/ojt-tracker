import { db } from "./firebase.js";
import { safeParseTime } from "./utils.js";

let logCache = {};

window.loadLogbook = async function (month = null, year = null) {

  const userDocId = localStorage.getItem("userDocId");
  if (!userDocId) return;

  const tbody = document.getElementById("logTableBody");
  if (!tbody) return;

  const now = new Date();
  month = month || (now.getMonth() + 1);
  year = year || now.getFullYear();

  const cacheKey = `${month}-${year}`;

  if (logCache[cacheKey]) {
    renderLogs(logCache[cacheKey], tbody);
    return;
  }

  try {
    const snapshot = await db.collection("users")
      .doc(userDocId)
      .collection("ojt_records")
      .where("month", "==", month)
      .where("year", "==", year)
      .orderBy("date", "asc")
      .get();

    const logs = [];

    snapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });

    logCache[cacheKey] = logs;

    renderLogs(logs, tbody);

  } catch (err) {
    console.error("Error loading logs:", err);
  }
};

function renderLogs(logs, tbody) {

  tbody.innerHTML = "";

  logs.forEach(d => {

    const am = (d.am_in && d.am_out)
      ? safeParseTime(d.am_out) - safeParseTime(d.am_in)
      : 0;

    const pm = (d.pm_in && d.pm_out)
      ? safeParseTime(d.pm_out) - safeParseTime(d.pm_in)
      : 0;

    const total = (am + pm).toFixed(2);
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
          <button onclick="deleteLog('${d.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

window.deleteLog = async function (id) {

  const userDocId = localStorage.getItem("userDocId");
  if (!userDocId) return;

  await db.collection("users")
    .doc(userDocId)
    .collection("ojt_records")
    .doc(id)
    .delete();

  alert("Deleted");

  logCache = {};

  const month = parseInt(document.getElementById("filterMonth")?.value);
  const year = parseInt(document.getElementById("filterYear")?.value);

  loadLogbook(month, year);
};