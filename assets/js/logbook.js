import { db } from "./firebase.js";
import { safeParseTime } from "./utils.js";

window.loadLogbook = async function (month = null, year = null) {
  const userDocId = localStorage.getItem("userDocId");

  const snapshot = await db.collection("users")
    .doc(userDocId)
    .collection("ojt_records")
    .orderBy("date", "asc")
    .get();

  const tbody = document.getElementById("logTableBody");
  tbody.innerHTML = "";

  snapshot.forEach(doc => {
    const d = doc.data();

    const am = (d.am_in && d.am_out)
      ? safeParseTime(d.am_out) - safeParseTime(d.am_in)
      : 0;

    const pm = (d.pm_in && d.pm_out)
      ? safeParseTime(d.pm_out) - safeParseTime(d.pm_in)
      : 0;

    const total = (am + pm).toFixed(2);

    tbody.innerHTML += `
      <tr>
        <td>${d.date}</td>
        <td>${d.am_in || "-"}</td>
        <td>${d.am_out || "-"}</td>
        <td>${d.pm_in || "-"}</td>
        <td>${d.pm_out || "-"}</td>
        <td>${d.status === "Absent" ? "Absent" : total}</td>
        <td><button onclick="deleteLog('${doc.id}')">Delete</button></td>
      </tr>
    `;
  });
};

window.deleteLog = async function (id) {
  const userDocId = localStorage.getItem("userDocId");

  await db.collection("users")
    .doc(userDocId)
    .collection("ojt_records")
    .doc(id)
    .delete();

  alert("Deleted");
  loadLogbook();
};