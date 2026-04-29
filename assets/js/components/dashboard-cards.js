document.addEventListener("DOMContentLoaded", async () => {

  const userDocId = localStorage.getItem("userDocId");

  if (!userDocId) return;

  const style = document.createElement("style");

style.textContent = `
  :root {
    --card-bg: #ffffff;
    --text-color: #111;
    --muted: #666;
    --border-color: #e5e5e5;
  }

  body.dark-mode {
    --card-bg: #1e1e1e;
    --text-color: #eaeaea;
    --muted: #aaaaaa;
    --border-color: #333;
  }

  .dashboard-row,
  #weeklyChart {
    width: 100%;
    max-width: 480px;
    margin: 16px auto;
    box-sizing: border-box;
  }

  .dashboard-row {
    display: flex;
    gap: 12px;
    padding: 0;
  }

  #statusCard, #burnoutCard {
    flex: 1 1 0;
    min-width: 0;
    padding: 16px;
    border-radius: 14px;
    background: var(--card-bg);
    color: var(--text-color);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
  }

  .title {
    font-size: 13px;
    font-weight: 700;
    color: var(--muted);
    margin-bottom: 6px;
  }

  .big {
    font-size: 17px;
    font-weight: 800;
    line-height: 1.35;
    word-break: break-word;
    text-align: center;
  }

  .sub {
    font-size: 12px;
    color: var(--muted);
    margin-top: 4px;
    line-height: 1.3;
    text-align: center;
  }

  @media (max-width: 360px) {
    .dashboard-row {
      flex-direction: column;
    }
  }

  #burnoutCard a:hover {
    transform: scale(1.02);
    display: block;
  }
`;

  document.head.appendChild(style);

  const userDoc = await db.collection("users").doc(userDocId).get();
  const data = userDoc.data();

  const { total } = await getTotalRecordedHours(userDocId);

  const target = Number(data.target_hours || 0);
  const remaining = Math.max(target - total, 0);
  const progress = target > 0 ? (total / target) * 100 : 0;

  const hoursPerDay = 8;
  const daysNeeded = Math.ceil(remaining / hoursPerDay);

  function addWorkDays(start, days) {
    let d = new Date(start);

    while (days > 0) {
      d.setDate(d.getDate() + 1);
      const day = d.getDay();

      if (day !== 0 && day !== 6) days--;
    }

    return d;
  }

  const finishDate = addWorkDays(new Date(), daysNeeded);

  const formattedDate = finishDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  let statusText = "";
  let statusColor = "#4caf50";

  if (progress < 40) {
    statusText = `You are ${Math.floor(remaining)} hours behind target`;
    statusColor = "#f44336";
  } else if (progress < 75) {
    statusText = "You are slightly behind schedule";
    statusColor = "#ffb300";
  } else if (progress < 100) {
    statusText = "You are on track";
    statusColor = "#4caf50";
  } else {
    statusText = "You are ahead of target 🔥";
    statusColor = "#1b5e20";
  }

  document.getElementById("statusCard").innerHTML = `
    <div class="title">Progress Status</div>

    <div class="big" style="color:${statusColor}">
      ${statusText}
    </div>

    <div class="sub">Based on your current progress</div>

    <div style="margin-top:12px; border-top:1px solid #eee; padding-top:10px;">
      <div class="sub">Expected Finish Date</div>
      <div class="big">
        ${formattedDate}
      </div>
    </div>

    <div class="sub" style="margin-top:8px;">
      ${Math.floor(total)} / ${target} hrs completed
    </div>
  `;

  function safeParse(t) {
    if (!t || !t.includes(":")) return 0;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  function getLast9DaysExcludingToday() {
    const arr = [];
    const today = new Date();

    for (let i = 9; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");

      arr.push({
        date: `${yyyy}-${mm}-${dd}`,
        jsDate: new Date(d),
      });
    }

    return arr;
  }

  const daysWindow = getLast9DaysExcludingToday();

  const snap = await db.collection("users")
    .doc(userDocId)
    .collection("ojt_records")
    .get();

  const map = {};

  snap.forEach(doc => {
    const d = doc.data();
    if (!d.date) return;

    const am = (d.am_in && d.am_out)
      ? safeParse(d.am_out) - safeParse(d.am_in)
      : 0;

    const pm = (d.pm_in && d.pm_out)
      ? safeParse(d.pm_out) - safeParse(d.pm_in)
      : 0;

    map[d.date] = (am + pm) / 60;
  });

  const grid = daysWindow.map(d => {

    const hours = map[d.date];

    let label = new Date(d.date).toLocaleDateString("en-US", {
      weekday: "short"
    });

    return {
      date: d.date,
      hours: hours ?? 0,
      label
    };
  });

  const heavy = grid.filter(d => d.hours >= 9).length;
  const normal = grid.filter(d => d.hours >= 6 && d.hours < 9).length;
  const light = grid.filter(d => d.hours > 0 && d.hours < 6).length;
  const inactive = grid.filter(d => d.hours === 0).length;

  let burnoutText = "Healthy pace";
  let burnoutColor = "#4caf50";
  let insight = "Based on your last 9 completed days";

  if (heavy >= 4) {
    burnoutText = "Burnout Risk";
    burnoutColor = "#f44336";
    insight = "You’ve had multiple intense workdays recently";
  } else if (light >= 4) {
    burnoutText = "Low Energy Pattern";
    burnoutColor = "#9e9e9e";
    insight = "Your recent workload has been lighter than usual";
  } else if (normal >= 5) {
    burnoutText = "Steady Progress";
    burnoutColor = "#4caf50";
    insight = "Your consistency is stable";
  }

  const dots = grid.map(d => {

    let color = "#bdbdbd";

    if (d.hours >= 9) color = "#f44336";
    else if (d.hours >= 6) color = "#4caf50";
    else if (d.hours > 0) color = "#ffb300";

    return `
      <div style="
        display:flex;
        flex-direction:column;
        align-items:center;
        width:30px;
        gap:3px;
      ">
        <div style="
          width:14px;
          height:14px;
          border-radius:50%;
          background:${color};
        "></div>

        <div style="
          font-size:9px;
        " class="sub">
          ${d.label}
        </div>
      </div>
    `;
  });

  const row1 = dots.slice(0, 3).join("");
  const row2 = dots.slice(3, 6).join("");
  const row3 = dots.slice(6, 9).join("");

  document.getElementById("burnoutCard").innerHTML = `
  <a href="burnout.html" style="text-decoration:none; color:inherit;">

    <div style="cursor:pointer;">

      <div class="title">Burnout Monitor</div>

      <div style="display:flex; flex-direction:column; gap:10px; margin:10px 0;">
        <div style="display:flex; gap:12px; justify-content:center;">
          ${row1}
        </div>

        <div style="display:flex; gap:12px; justify-content:center;">
          ${row2}
        </div>

        <div style="display:flex; gap:12px; justify-content:center;">
          ${row3}
        </div>
      </div>

      <div class="big" style="color:${burnoutColor}">
        ${burnoutText}
      </div>

      <div class="sub">
        ${insight}
      </div>

      <div style="
        margin-top:12px;
        display:flex;
        justify-content:center;
        gap:10px;
        flex-wrap:wrap;
        font-size:10px;
        color:#666;
      ">

        <div style="display:flex; align-items:center; gap:4px;">
          <span style="color:#f44336;">●</span>
          Heavy (9h+)
        </div>

        <div style="display:flex; align-items:center; gap:4px;">
          <span style="color:#4caf50;">●</span>
          Normal (6–8h)
        </div>

        <div style="display:flex; align-items:center; gap:4px;">
          <span style="color:#ffb300;">●</span>
          Light (1–5h)
        </div>

        <div style="display:flex; align-items:center; gap:4px;">
          <span style="color:#bdbdbd;">●</span>
          No record
        </div>

      </div>

    </div>

  </a>
`;
});