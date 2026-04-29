const style = document.createElement("style");

style.textContent = `
.top-bar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 10px 15px;

    background: linear-gradient(135deg, #ffffff, #f3f5f7);
    box-shadow: 0 4px 18px rgba(0,0,0,0.08);
    color: #111;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 9999;
}

body.dark-mode .top-bar {
    background: linear-gradient(135deg, #1a1a1a, #111111);
    box-shadow: 0 4px 18px rgba(0,0,0,0.6);
    color: #fff;
}

/* layout */
.left-side { justify-self: start; display: flex; gap: 10px; }
.center-title { justify-self: center; font-weight: 600; font-size: 18px; }
.right-side { justify-self: end; display: flex; gap: 12px; }

/* ICONS */
.icon {
    cursor: pointer;
    font-size: 18px;
    color: inherit;
    transition: transform 0.2s ease;
    display: flex;
    align-items: center;
}

.icon:hover {
    transform: scale(1.15);
}
`;

document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", () => {

const container = document.getElementById("topBarContainer");
if (!container) return;

const topBar = document.createElement("div");
topBar.className = "top-bar";

const page = window.location.pathname.split("/").pop().split("?")[0];
const isHome = page === "homepage.html" || page === "index.html";

const left = document.createElement("div");
left.className = "left-side";

if (!isHome) {

    const back = document.createElement("i");
    back.className = "fa-solid fa-arrow-left icon";

    back.onclick = () => {
        window.history.back();
    };

    left.appendChild(back);
} else {
}

const center = document.createElement("div");
center.className = "center-title";

const title = document.createElement("span");
title.textContent = "OJT Tracker";

center.appendChild(title);

const right = document.createElement("div");
right.className = "right-side";

if (isHome) {

    const settings = document.createElement("i");
    settings.className = "fa-solid fa-gear icon";

    settings.onclick = () => {
        window.location.href = "settings.html";
    };

    const mode = document.createElement("i");
    mode.className = "icon";

    const saved = localStorage.getItem("theme");

    function setTheme(isDark) {
        if (isDark) {
            document.body.classList.add("dark-mode");
            mode.className = "fa-solid fa-sun icon";
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            mode.className = "fa-regular fa-moon icon";
            localStorage.setItem("theme", "light");
        }
    }

    setTheme(saved === "dark");

    mode.onclick = () => {
        setTheme(!document.body.classList.contains("dark-mode"));
    };

    left.appendChild(settings);
    right.appendChild(mode);
}

topBar.appendChild(left);
topBar.appendChild(center);
topBar.appendChild(right);

container.appendChild(topBar);

});