const DASH_ANIM_DELAY = 300;

document.addEventListener("DOMContentLoaded", async () => {

  // ================= INIT =================
  // load only when DOM is ready + user exists in localStorage
  const userDocId = localStorage.getItem("userDocId");

  // IMPORTANT:
  // if no user ID → stop everything (prevents broken UI + Firebase calls)
  if (!userDocId) return;

  // ================= DOM ELEMENTS =================
  // grabbing all ring + dashboard elements once (performance-friendly)
  const card = document.querySelector(".ojt-progress-card");
  const wrapper = document.querySelector(".ring-wrapper");
  const ring = document.querySelector(".ring-fill");
  const bg = document.querySelector(".ring-bg");
  const info = document.querySelector(".ring-info");
  const percentEl = document.getElementById("ringPercent");

  // SVG geometry setup (circle math)
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  // ================= CARD STYLING =================
  // inline styling (dynamic layout system for dashboard card)
  card.style.width = "100%";
  card.style.maxWidth = "480px";
  card.style.margin = "16px auto";
  card.style.padding = "14px 16px";

  card.style.boxSizing = "border-box";
  card.style.borderRadius = "14px";
  card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.20)";
  card.style.background = "#fff";

  card.style.display = "flex";
  card.style.alignItems = "center";
  card.style.justifyContent = "space-between";
  card.style.gap = "30px";

  // ================= RING WRAPPER =================
  // container for circular progress UI
  wrapper.style.position = "relative";
  wrapper.style.width = "120px";
  wrapper.style.height = "120px";
  wrapper.style.flexShrink = "0";

  // ================= INFO TEXT STYLE =================
  // left-side text block styling (progress details)
  info.style.display = "flex";
  info.style.flexDirection = "column";
  info.style.alignItems = "flex-start";
  info.style.textAlign = "left";
  info.style.flex = "1";
  info.style.minWidth = "0";
  info.style.gap = "2px";
  info.style.marginLeft = "0px";
  info.style.padding = "0";
  info.style.lineHeight = "1.15";

  // IMPORTANT:
  // all text inside info gets bold styling for strong hierarchy
  info.querySelectorAll("p").forEach(p => {
    p.style.fontWeight = "700";
    p.style.color = "#222";
    p.style.margin = "2px 0";
  });

  // ================= SVG RING STYLE =================
  // background ring (static track)
  bg.style.fill = "none";
  bg.style.stroke = "#e6e6e6";
  bg.style.strokeWidth = "18";

  // animated progress ring
  ring.style.fill = "none";
  ring.style.strokeWidth = "18";
  ring.style.strokeLinecap = "round";
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;
  ring.style.transition = "stroke-dashoffset 0.05s linear";

  // ================= RING ORIENTATION FIX =================
  // rotates SVG so progress starts from top + flows correctly
  const svg = document.querySelector(".progress-ring");
  svg.style.transform = "rotate(90deg) scaleX(-1)";

  // ================= CENTER PERCENT TEXT =================
  // absolute center overlay inside circle
  percentEl.style.position = "absolute";
  percentEl.style.top = "50%";
  percentEl.style.left = "50%";
  percentEl.style.transform = "translate(-50%, -50%)";
  percentEl.style.fontSize = "22px";
  percentEl.style.fontWeight = "900";
  percentEl.style.pointerEvents = "none";

  // ================= FIREBASE DATA FETCH =================
  const { total, absentCount } = await getTotalRecordedHours(userDocId);

  const userDoc = await db.collection("users").doc(userDocId).get();
  const data = userDoc.data();

  const requiredHours = Number(data?.target_hours || 486);
  const totalHours = Number(total || 0);

  const targetPercent = requiredHours > 0
    ? Math.min((totalHours / requiredHours) * 100, 100)
    : 0;

  // ================= DAYS PRESENT CALCULATION =================
  const recordsSnap = await db
    .collection("users")
    .doc(userDocId)
    .collection("ojt_records")
    .get();

  const totalRecords = recordsSnap.size;
  const safeAbsent = Number(absentCount || 0);

  const presentDays = Math.max(totalRecords - safeAbsent, 0);

  const absenceText =
    safeAbsent === 1 ? "1 Absence" : `${safeAbsent} Absences`;

  document.getElementById("daysText").innerHTML =
    `${presentDays} Days Completed<br>
     <span style="font-size:12px; color:#777; font-weight:600;">
       ${absenceText}
     </span>`;

  // ================= ANIMATION ENGINE =================
  // smooth fill animation from 0 → target %
  let progress = 0;

  const animate = () => {
    progress += 1.5;

    if (progress > targetPercent) progress = targetPercent;

    const offset = circumference - (progress / 100) * circumference;
    ring.style.strokeDashoffset = offset;

    // ================= COLOR LOGIC =================
    // progress-based visual feedback
    let color = "#4caf50";

    if (progress < 50) color = "#f44336";
    else if (progress < 75) color = "#ffb300";
    else color = "#4caf50";

    ring.style.stroke = color;

    percentEl.textContent = `${Math.round(progress)}%`;

    if (progress < targetPercent) {
      requestAnimationFrame(animate);
    }
  };

  // IMPORTANT:
  // slight delay makes animation feel smoother + less "instant load"
  setTimeout(() => {
    animate();
  }, DASH_ANIM_DELAY);

  // ================= SUMMARY TEXTS =================
  document.getElementById("hoursText").textContent =
    `${Math.floor(totalHours)} / ${requiredHours} hrs`;

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