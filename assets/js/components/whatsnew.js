if (typeof db === "undefined") {
  console.error("Firestore db is not available in whatsnew.js");
}

const CURRENT_WHATSNEW_VERSION = window.APP_CONFIG.version;

function createWhatsNewModal(onClose) {

  const overlay = document.createElement("div");
  overlay.className = "popup-overlay whatsnew";
  overlay.style.zIndex = "99999"; 

  overlay.innerHTML = `
    <div class="popup">
      <h2>✨ What’s New</h2>

      <div style="text-align:left; font-size:14px; margin:10px 0;">
        <ul>
          ${window.APP_CONFIG.whatsNew.map(item => `
            <li>
              ${item.title}
              ${item.details ? `
                <ul style="margin-top:5px; padding-left:18px; font-size:13px; color:#aaa;">
                  ${item.details.map(d => `<li>${d}</li>`).join("")}
                </ul>
              ` : ""}
            </li>
          `).join("")}
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

  if (document.getElementById("ojtPopup")?.style.display === "flex") {
    return;
  }

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