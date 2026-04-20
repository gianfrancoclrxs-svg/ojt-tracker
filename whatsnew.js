const CURRENT_WHATSNEW_VERSION = "1.1.3"; 

function createWhatsNewModal(onClose) {
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";

  overlay.innerHTML = `
    <div class="popup">
      <h2>✨ What’s New</h2>

      <div style="text-align:left; font-size:14px; margin:10px 0;">
        <ul>
            <li>Added half-day record system for tracking half-day attendance</li>
            <li>Added filtering by month and year in the logbook</li>
            <li>Improved logbook UI with color indicators for attendance status</li>
            <li>Improved overall user interface and design</li>
            <li>Fixed bugs and improved system stability</li>
        </ul>
      </div>

      <button id="closeWhatsNew">Got it</button>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("closeWhatsNew").addEventListener("click", () => {
    overlay.remove();
    onClose();
  });
}

async function checkWhatsNew() {
  const userDocId = localStorage.getItem("userDocId");
  if (!userDocId) return;

  const userRef = db.collection("users").doc(userDocId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) return;

  const data = userSnap.data();
  const lastSeen = data.whatsnew_version || "";

  if (lastSeen === CURRENT_WHATSNEW_VERSION) return;

  createWhatsNewModal(async () => {
    await userRef.update({
      whatsnew_version: CURRENT_WHATSNEW_VERSION
    });
  });
}