(function () {

  function createWarningPopup(message) {

    if (document.getElementById("appWarningPopup")) return;

    const overlay = document.createElement("div");
    overlay.id = "appWarningPopup";

    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.65);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
    `;

    overlay.innerHTML = `
      <div style="
        background: #fff;
        width: 90%;
        max-width: 420px;
        border-radius: 12px;
        padding: 22px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        font-family: Arial, sans-serif;
      ">

        <div style="font-size: 42px;">⚠️</div>

        <h2 style="margin: 10px 0;">System Warning</h2>

        <p style="color:#444; font-size:14px; line-height:1.5; text-align:left; white-space:pre-line;">
        ${message}
        </p>

        <button id="closeWarningBtn" style="
          margin-top: 15px;
          padding: 10px 16px;
          border: none;
          background: #e53935;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        ">
          Close
        </button>

      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("closeWarningBtn").onclick = () => {
      overlay.remove();
    };
  }

  // ===============================
  // AUTO SHOW ON LOAD
  // ===============================
    window.addEventListener("DOMContentLoaded", () => {
    createWarningPopup(`
    High system usage detected.

    The application has reached its daily free usage limit and may experience delays or temporary issues when loading or saving records.

    • Reads have already exceeded the 50K limit. 
    • Over quota: +3,400 reads  
    • Status: No-cost quota fully consumed  
    • Plan: Free plan only  

    We are currently running on a free plan, so system limits are strict.

    Sorry for the inconvenience 😔

    Some features such as logbook updates, dashboard data, or record syncing may not work properly until the system resets.

    Please continue with caution.
    `);
    });

  // optional manual control
  window.showAppWarning = createWarningPopup;

})();