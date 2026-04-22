const DASH_ANIM_DELAY = 300;

document.addEventListener("DOMContentLoaded", async () => {

  const userDocId = localStorage.getItem("userDocId");
  if (!userDocId) return;

  // ================= THEME HELPER =================
  const isDarkMode = () => document.body.classList.contains("dark-mode");

  const getTheme = () => ({
    cardBg: isDarkMode() ? "#1e1e1e" : "#fff",
    text: isDarkMode() ? "#eaeaea" : "#222",
    muted: isDarkMode() ? "#aaaaaa" : "#777",
    ringBg: isDarkMode() ? "#333" : "#e6e6e6"
  });

  // ================= ELEMENTS =================
  const card = document.querySelector(".ojt-progress-card");
  const wrapper = document.querySelector(".ring-wrapper");
  const ring = document.querySelector(".ring-fill");
  const bg = document.querySelector(".ring-bg");
  const info = document.querySelector(".ring-info");
  const percentEl = document.getElementById("ringPercent");

  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  const applyTheme = () => {
    const t = getTheme();

    // ================= CARD =================
    card.style.width = "100%";
    card.style.maxWidth = "480px";
    card.style.margin = "16px auto";
    card.style.padding = "14px 16px";
    card.style.boxSizing = "border-box";
    card.style.borderRadius = "14px";
    card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.20)";
    card.style.background = t.cardBg;
    card.style.color = t.text;

    card.style.display = "flex";
    card.style.alignItems = "center";
    card.style.justifyContent = "space-between";
    card.style.gap = "30px";

    // ================= INFO TEXT =================
    info.querySelectorAll("p").forEach(p => {
      p.style.fontWeight = "700";
      p.style.color = t.text;
      p.style.margin = "2px 0";
    });

    // ================= RING COLORS (IMPORTANT FIX) =================
    bg.style.stroke = t.ringBg;   // gray track stays visible
    bg.style.fill = "none";       // prevents black fill bug
    ring.style.fill = "none";     // prevents black center issue
  };

  applyTheme();

  // auto reapply when theme changes
  const observer = new MutationObserver(applyTheme);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });

  // ================= WRAPPER =================
  wrapper.style.position = "relative";
  wrapper.style.width = "120px";
  wrapper.style.height = "120px";
  wrapper.style.flexShrink = "0";

  // ================= INFO =================
  info.style.display = "flex";
  info.style.flexDirection = "column";
  info.style.gap = "2px";
  info.style.flex = "1";
  info.style.minWidth = "0";
  info.style.lineHeight = "1.15";
  info.style.alignItems = "flex-start"; 
  info.style.textAlign = "left";  

  // ================= SVG RING =================
  ring.style.fill = "none";
  ring.style.strokeWidth = "18";
  ring.style.strokeLinecap = "round";
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;
  ring.style.transition = "stroke-dashoffset 0.05s linear";

  bg.style.fill = "none";
  bg.style.strokeWidth = "18";

  const svg = document.querySelector(".progress-ring");
  svg.style.transform = "rotate(90deg) scaleX(-1)";

  // ================= CENTER PERCENT =================
  percentEl.style.position = "absolute";
  percentEl.style.top = "50%";
  percentEl.style.left = "50%";
  percentEl.style.transform = "translate(-50%, -50%)";
  percentEl.style.fontSize = "22px";
  percentEl.style.fontWeight = "900";
  percentEl.style.pointerEvents = "none";

  // ================= DATA =================
  const { total, absentCount } = await getTotalRecordedHours(userDocId);

  const userDoc = await db.collection("users").doc(userDocId).get();
  const data = userDoc.data();

  const requiredHours = Number(data?.target_hours || 486);
  const totalHours = Number(total || 0);

  const targetPercent = requiredHours > 0
    ? Math.min((totalHours / requiredHours) * 100, 100)
    : 0;

  const recordsSnap = await db
    .collection("users")
    .doc(userDocId)
    .collection("ojt_records")
    .get();

  const totalRecords = recordsSnap.size;
  const presentDays = Math.max(totalRecords - (absentCount || 0), 0);

  document.getElementById("daysText").innerHTML =
    `${presentDays} Days Completed<br>
     <span style="font-size:12px; color:${getTheme().muted}; font-weight:600;">
       ${(absentCount || 0)} Absences
     </span>`;

  document.getElementById("hoursText").textContent =
    `${Math.floor(totalHours)} / ${requiredHours} hrs`;

  // ================= ANIMATION =================
  let progress = 0;

  const animate = () => {
    progress += 1.5;
    if (progress > targetPercent) progress = targetPercent;

    const offset = circumference - (progress / 100) * circumference;
    ring.style.strokeDashoffset = offset;

    let color = "#4caf50";
    if (progress < 50) color = "#f44336";
    else if (progress < 75) color = "#ffb300";

    ring.style.stroke = color;

    percentEl.textContent = `${Math.round(progress)}%`;

    if (progress < targetPercent) {
      requestAnimationFrame(animate);
    }
  };

  setTimeout(() => animate(), DASH_ANIM_DELAY);

  // ================= MILESTONE =================
  const milestoneEl = document.getElementById("milestoneText");

  let milestone = "Starting out";
  let color = "#f44336";

  if (targetPercent >= 75) {
    milestone = "Almost Complete";
    color = "#4caf50";
  } else if (targetPercent >= 50) {
    milestone = "In Progress";
    color = "#ffb300";
  } else if (targetPercent >= 25) {
    milestone = "Getting Started";
    color = "#ff7043";
  }

  milestoneEl.textContent = milestone;
  milestoneEl.style.color = color;
  milestoneEl.style.fontWeight = "800";

});