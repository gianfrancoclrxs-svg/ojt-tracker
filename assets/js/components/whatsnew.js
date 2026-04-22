
// ================= FIRESTORE SAFETY CHECK =================
// prevents silent failures if Firebase isn't loaded properly
if (typeof db === "undefined") {
  console.error("Firestore db is not available in whatsnew.js");
}

// ================= VERSION CONTROL =================
// IMPORTANT:
// update this manually every time you release a new feature batch
const CURRENT_WHATSNEW_VERSION = window.APP_CONFIG.version;

// ================= WHAT'S NEW MODAL =================
// reusable popup that shows app updates
function createWhatsNewModal(onClose) {

  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";

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

  // ================= CLOSE HANDLER =================
  // removes modal + triggers version update callback
  document.getElementById("closeWhatsNew").addEventListener("click", () => {
    overlay.remove();
    onClose();
  });
}

// ================= VERSION CHECK LOGIC =================
// decides whether user should see "What’s New" popup
async function checkWhatsNew() {

  const userDocId = localStorage.getItem("userDocId");

  // IMPORTANT:
  // no user → skip entirely (no Firestore call wasted)
  if (!userDocId) return;

  const userRef = db.collection("users").doc(userDocId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) return;

  const data = userSnap.data();

  // last version user has already seen
  const lastSeen = data.whatsnew_version || "";

  // if already updated → do nothing
  if (lastSeen === CURRENT_WHATSNEW_VERSION) return;

  // show modal
  createWhatsNewModal(async () => {

    // IMPORTANT:
    // mark version as seen so popup won’t spam user again
    await userRef.update({
      whatsnew_version: CURRENT_WHATSNEW_VERSION
    });

  });
}