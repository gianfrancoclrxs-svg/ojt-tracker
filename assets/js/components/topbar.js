// ================= TOP BAR STYLES =================
// global styling injected for reusable top navigation component
const style = document.createElement("style");

style.textContent = `
    .top-bar {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        padding: 10px 15px;
    }

    .left-side {
        justify-self: start;
    }

    .center-title {
        justify-self: center;
        font-weight: 600;
        font-size: 18px;
    }

    .right-side {
        justify-self: end;
    }

    #settingsBtn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
    }

    #modeToggle {
        cursor: pointer;
        font-size: 18px;
    }

    #backBtn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
    }
`;

document.head.appendChild(style);

// ================= TOP BAR INIT =================
// builds the navbar dynamically depending on current page
document.addEventListener("DOMContentLoaded", () => {

    // create main container
    const topBar = document.createElement("div");
    topBar.className = "top-bar";

    // IMPORTANT:
    // detects if user is on homepage → changes behavior (settings vs back button)
    const isHomePage =
        window.location.pathname.includes("homepage.html") ||
        window.location.pathname === "/" ||
        window.location.pathname.endsWith("index.html");

    // ================= LEFT SIDE =================
    const leftSide = document.createElement("div");
    leftSide.className = "left-side";

    if (isHomePage) {

        // SETTINGS BUTTON (homepage only)
        const settingsBtn = document.createElement("button");
        settingsBtn.id = "settingsBtn";

        settingsBtn.onclick = () => {
            window.location.href = "settings.html";
        };

        const gearIcon = document.createElement("i");
        gearIcon.className = "fa-solid fa-gear";

        settingsBtn.appendChild(gearIcon);
        leftSide.appendChild(settingsBtn);

    } else {

        // BACK BUTTON (non-home pages)
        // simple navigation fallback using browser history
        const backBtn = document.createElement("button");
        backBtn.id = "backBtn";

        backBtn.onclick = () => {
            window.history.back();
        };

        const backIcon = document.createElement("i");
        backIcon.className = "fa-solid fa-arrow-left";

        backBtn.appendChild(backIcon);
        leftSide.appendChild(backBtn);
    }

    // ================= CENTER TITLE =================
    // app branding (safe to change anytime)
    const center = document.createElement("div");
    center.className = "center-title";

    const appName = document.createElement("span");
    appName.textContent = "OJT Tracker";

    center.appendChild(appName);

    // ================= RIGHT SIDE =================
    // theme toggle placeholder (dark mode feature hook)
    const rightSide = document.createElement("div");
    rightSide.className = "right-side";

    const modeToggle = document.createElement("span");
    modeToggle.id = "modeToggle";

    const moonIcon = document.createElement("i");
    moonIcon.className = "fa-regular fa-moon";

    modeToggle.appendChild(moonIcon);
    rightSide.appendChild(modeToggle);

    // ================= ASSEMBLY =================
    topBar.appendChild(leftSide);
    topBar.appendChild(center);
    topBar.appendChild(rightSide);

    // IMPORTANT:
    // requires #topBarContainer in HTML or nothing will render (silent fail risk)
    document.getElementById("topBarContainer").appendChild(topBar);
});