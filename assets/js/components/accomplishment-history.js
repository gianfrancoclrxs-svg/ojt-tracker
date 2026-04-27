document.addEventListener("DOMContentLoaded", async () => {

  const userDocId = localStorage.getItem("userDocId");
  if (!userDocId) return;

  const list = document.getElementById("list");

  const snap = await db.collection("users")
    .doc(userDocId)
    .collection("daily_accomplishments")
    .orderBy("date", "desc")
    .get();

  if (snap.empty) {
    list.innerHTML = `<div class="empty">No accomplishments yet.</div>`;
    return;
  }

  snap.forEach(doc => {

    const data = doc.data();

    const card = document.createElement("div");
    card.className = "card";

    const date = document.createElement("div");
    date.className = "date";
    date.textContent = data.date;

    const text = document.createElement("div");
    text.className = "text";
    text.textContent = data.text || "No text";

    card.appendChild(date);
    card.appendChild(text);

    list.appendChild(card);
  });

});