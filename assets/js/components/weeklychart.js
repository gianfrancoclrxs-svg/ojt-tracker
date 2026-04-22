const isDarkMode = () => document.body.classList.contains("dark-mode");

const getTheme = () => ({
  cardBg: isDarkMode() ? "#1e1e1e" : "#fff",
  text: isDarkMode() ? "#eaeaea" : "#222",
  muted: isDarkMode() ? "#aaaaaa" : "#666",
  grid: isDarkMode() ? "#333" : "#e0e0e0",
  tooltipBg: isDarkMode() ? "rgba(30,30,30,0.95)" : "rgba(0,0,0,0.85)"
});

document.addEventListener("DOMContentLoaded", async () => {

  // ================= TOOLTIP =================
  const tooltip = document.createElement("div");

  tooltip.style.position = "fixed";
  tooltip.style.padding = "6px 10px";
  tooltip.style.borderRadius = "8px";
  tooltip.style.fontSize = "12px";
  tooltip.style.pointerEvents = "none";
  tooltip.style.opacity = "0";
  tooltip.style.transition = "0.15s ease";
  tooltip.style.zIndex = "9999";
  tooltip.style.maxWidth = "240px";
  tooltip.style.whiteSpace = "nowrap";

  document.body.appendChild(tooltip);

  // Hide tooltip when clicking anywhere
  document.addEventListener("click", () => {
    tooltip.style.opacity = "0";
  });

  const userDocId = localStorage.getItem("userDocId");
  if (!userDocId) return;

  const mount = document.getElementById("weeklyChart");
  if (!mount) return;

  const dbRef = db.collection("users")
    .doc(userDocId)
    .collection("ojt_records");

  function toMinutes(time) {
    if (!time || !time.includes(":")) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }

  function calcHours(data) {
    const am = toMinutes(data.am_out) - toMinutes(data.am_in);
    const pm = toMinutes(data.pm_out) - toMinutes(data.pm_in);
    return ((am > 0 ? am : 0) + (pm > 0 ? pm : 0)) / 60;
  }

  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d;
  }

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const monday = getMonday(new Date());

  const weekDates = labels.map((l, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label: l, date: formatDate(d) };
  });

  const snapshots = await Promise.all(
    weekDates.map(d => dbRef.where("date", "==", d.date).get())
  );

  const week = Object.fromEntries(
    labels.map(l => [l, { hours: 0, logs: [] }])
  );

  snapshots.forEach((snap, i) => {
    const label = labels[i];

    snap.forEach(doc => {
      const data = doc.data();
      const hours = calcHours(data);

      week[label].hours += hours;
      week[label].logs.push(data);
    });
  });

  const values = labels.map(l => week[l].hours);

  // ================= CARD =================
  const card = document.createElement("div");
  const t = getTheme();

  card.style.width = "100%";
  card.style.maxWidth = "480px";
  card.style.margin = "16px auto";
  card.style.padding = "14px 16px";
  card.style.borderRadius = "14px";
  card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.20)";
  card.style.background = t.cardBg;
  card.style.color = t.text;
  card.style.boxSizing = "border-box";

  card.style.opacity = "0";
  card.style.transform = "translateY(10px)";
  card.style.transition = "0.3s ease";

  const title = document.createElement("h3");
  title.textContent = "Weekly Activity (Mon–Fri)";
  title.style.fontSize = "16px";
  title.style.fontWeight = "700";
  title.style.marginBottom = "12px";
  title.style.color = t.text;

  card.appendChild(title);

  // ================= WRAPPER =================
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.gap = "10px";
  wrapper.style.alignItems = "flex-end";

  // ================= AXIS =================
  const axis = document.createElement("div");
  axis.style.display = "flex";
  axis.style.flexDirection = "column";
  axis.style.justifyContent = "space-between";
  axis.style.height = "120px";
  axis.style.fontSize = "11px";
  axis.style.color = t.muted;
  axis.style.paddingRight = "6px";

  [10, 8, 6, 4, 2, 0].forEach(v => {
    const el = document.createElement("div");
    el.textContent = v + "h";
    axis.appendChild(el);
  });

  // ================= BARS =================
  const bars = document.createElement("div");
  bars.style.display = "flex";
  bars.style.justifyContent = "space-between";
  bars.style.alignItems = "flex-end";
  bars.style.height = "120px";
  bars.style.flex = "1";

  const maxHours = 10;
  const maxBarHeight = 90;

  labels.forEach((label, i) => {

    const value = values[i];
    const logs = week[label].logs;

    const col = document.createElement("div");
    col.style.display = "flex";
    col.style.flexDirection = "column";
    col.style.alignItems = "center";
    col.style.flex = "1";
    col.style.justifyContent = "flex-end";

    const bar = document.createElement("div");

    const height = Math.min((value / maxHours) * maxBarHeight, maxBarHeight);

    let color = "#888";
    if (value >= 9) color = "#1b5e20";
    else if (value >= 8) color = "#4caf50";
    else if (value >= 6) color = "#ffb300";
    else if (value > 0) color = "#f44336";

    bar.style.width = "14px";
    bar.style.height = "0px";
    bar.style.background = color;
    bar.style.borderRadius = "6px";
    bar.style.transition = "height 0.7s ease";
    bar.style.cursor = "pointer";

// ================= TOOLTIP EVENTS (MOBILE ONLY) =================
bar.addEventListener("click", (e) => {
  e.stopPropagation();

  tooltip.style.opacity = "1";

  // 🎨 Always readable colors
  tooltip.style.background = isDarkMode()
    ? "rgba(40,40,40,0.95)"
    : "rgba(0,0,0,0.85)";
  tooltip.style.color = "#fff";

  if (!logs.length) {
    tooltip.innerHTML = `<b>${label}</b><br>No record`;
  } else {
    const d = logs[0];

    tooltip.innerHTML = `
      <b>${label}</b><br>
      AM: ${d.am_in} → ${d.am_out}<br>
      PM: ${d.pm_in} → ${d.pm_out}<br>
      <b>Total: ${value.toFixed(2)} hrs</b>
    `;
  }

  // 📍 Position exactly where user taps
  const x = e.clientX;
  const y = e.clientY;

  tooltip.style.left = x + "px";
  tooltip.style.top = (y - 10) + "px";
  tooltip.style.transform = "translate(-50%, -100%)";

  // 🧠 Keep tooltip inside screen
  requestAnimationFrame(() => {
    const rect = tooltip.getBoundingClientRect();

    if (rect.left < 8) {
      tooltip.style.left = "8px";
      tooltip.style.transform = "translate(0, -100%)";
    }

    if (rect.right > window.innerWidth - 8) {
      tooltip.style.left = (window.innerWidth - rect.width - 8) + "px";
      tooltip.style.transform = "translate(0, -100%)";
    }

    if (rect.top < 8) {
      tooltip.style.top = (y + 14) + "px";
      tooltip.style.transform = "translate(-50%, 0)";
    }
  });
});

const text = document.createElement("span");
text.textContent = label;
text.style.fontSize = "12px";
text.style.marginTop = "6px";
text.style.color = t.muted;

col.appendChild(bar);
col.appendChild(text);
bars.appendChild(col);

// Animate bar
setTimeout(() => {
  bar.style.height = value > 0 ? height + "px" : "6px";
}, 300 + i * 80);
});

// ================= CLOSE TOOLTIP ON OUTSIDE CLICK =================
document.addEventListener("click", () => {
  tooltip.style.opacity = "0";
});

// ================= FINAL RENDER =================
wrapper.appendChild(axis);
wrapper.appendChild(bars);
card.appendChild(wrapper);

mount.parentNode.insertBefore(card, mount);

// entrance animation
requestAnimationFrame(() => {
  card.style.opacity = "1";
  card.style.transform = "translateY(0)";
});
});