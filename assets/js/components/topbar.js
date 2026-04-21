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

document.addEventListener("DOMContentLoaded", () => {
    const topBar = document.createElement("div");
    topBar.className = "top-bar";
    const isHomePage = window.location.pathname.includes("homepage.html") 
    || window.location.pathname === "/" 
    || window.location.pathname.endsWith("index.html");

  // LEFT SIDE
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
        // BACK BUTTON (other pages)
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

  // CENTER (APP NAME)
  const center = document.createElement("div");
  center.className = "center-title";

  const appName = document.createElement("span");
  appName.textContent = "OJT Tracker"; // 👈 change this anytime

  center.appendChild(appName);

  // RIGHT SIDE
  const rightSide = document.createElement("div");
  rightSide.className = "right-side";

  const modeToggle = document.createElement("span");
  modeToggle.id = "modeToggle";

  const moonIcon = document.createElement("i");
  moonIcon.className = "fa-regular fa-moon";

  modeToggle.appendChild(moonIcon);
  rightSide.appendChild(modeToggle);

  // ASSEMBLE
  topBar.appendChild(leftSide);
  topBar.appendChild(center);
  topBar.appendChild(rightSide);

  document.getElementById("topBarContainer").appendChild(topBar);
});