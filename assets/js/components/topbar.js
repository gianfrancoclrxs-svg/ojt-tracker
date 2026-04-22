// ================= TOP BAR STYLES =================
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

    #settingsBtn,
    #backBtn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
    }

    #modeToggle {
        cursor: pointer;
        font-size: 18px;
    }
`;

document.head.appendChild(style);


// ================= TOP BAR INIT =================
document.addEventListener("DOMContentLoaded", () => {

    const container = document.getElementById("topBarContainer");
    if (!container) return; // safety

    // create main container
    const topBar = document.createElement("div");
    topBar.className = "top-bar";

    // detect homepage
    const isHomePage =
        window.location.pathname.includes("homepage.html") ||
        window.location.pathname === "/" ||
        window.location.pathname.endsWith("index.html");


    // ================= LEFT SIDE =================
    const leftSide = document.createElement("div");
    leftSide.className = "left-side";

    if (isHomePage) {
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


    // ================= CENTER =================
    const center = document.createElement("div");
    center.className = "center-title";

    const appName = document.createElement("span");
    appName.textContent = "OJT Tracker";

    center.appendChild(appName);


    // ================= RIGHT SIDE =================
    const rightSide = document.createElement("div");
    rightSide.className = "right-side";

    const modeToggle = document.createElement("span");
    modeToggle.id = "modeToggle";

    const icon = document.createElement("i");
    icon.className = "fa-regular fa-moon";

    modeToggle.appendChild(icon);
    rightSide.appendChild(modeToggle);


    // ================= DARK MODE LOAD =================
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        icon.classList.replace("fa-moon", "fa-sun");
    }


    // ================= DARK MODE TOGGLE =================
    modeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-mode");

        if (isDark) {
            icon.classList.replace("fa-moon", "fa-sun");
            localStorage.setItem("theme", "dark");
        } else {
            icon.classList.replace("fa-sun", "fa-moon");
            localStorage.setItem("theme", "light");
        }
    });


    // ================= ASSEMBLY =================
    topBar.appendChild(leftSide);
    topBar.appendChild(center);
    topBar.appendChild(rightSide);

    container.appendChild(topBar);
});