    document.addEventListener("DOMContentLoaded", async () => {

        // =========================
        // TOOLTIP
        // =========================
        const tooltip = document.createElement("div");

        tooltip.style.position = "fixed";
        tooltip.style.background = "rgba(0,0,0,0.85)";
        tooltip.style.color = "#fff";
        tooltip.style.padding = "6px 10px";
        tooltip.style.borderRadius = "8px";
        tooltip.style.fontSize = "12px";
        tooltip.style.pointerEvents = "none";
        tooltip.style.opacity = "0";
        tooltip.style.transition = "0.15s ease";
        tooltip.style.zIndex = "9999";

        document.body.appendChild(tooltip);

        const userDocId = localStorage.getItem("userDocId");
        if (!userDocId) return;

        const mount = document.getElementById("weeklyChart");
        if (!mount) return;

        const dbRef = db.collection("users")
            .doc(userDocId)
            .collection("ojt_records");

        // =========================
        // HELPERS
        // =========================
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
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            return `${y}-${m}-${d}`;
        }

        function getMonday(date) {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            d.setDate(diff);
            return d;
        }

        // =========================
        // WEEK SETUP
        // =========================
        const labels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
        const today = new Date();
        const monday = getMonday(today);

        const weekDates = [];

        for (let i = 0; i < 5; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);

            weekDates.push({
                label: labels[i],
                date: formatDate(d),
                logs: []
            });
        }

        // =========================
        // FETCH FIRESTORE
        // =========================
        const snapshots = await Promise.all(
            weekDates.map(d =>
                dbRef.where("date", "==", d.date).get()
            )
        );

        // =========================
        // BUILD WEEK DATA
        // =========================
        const week = {
            Mon: { hours: 0, logs: [] },
            Tue: { hours: 0, logs: [] },
            Wed: { hours: 0, logs: [] },
            Thu: { hours: 0, logs: [] },
            Fri: { hours: 0, logs: [] }
        };

        snapshots.forEach((snap, i) => {

            const label = labels[i];

            snap.forEach(doc => {
                const data = doc.data();

                const hours = calcHours(data);

                week[label].hours += hours;

                week[label].logs.push({
                    am_in: data.am_in || "--",
                    am_out: data.am_out || "--",
                    pm_in: data.pm_in || "--",
                    pm_out: data.pm_out || "--",
                    total: hours
                });
            });
        });

        const values = labels.map(l => week[l].hours);

        // =========================
        // CARD
        // =========================
        const card = document.createElement("div");

        card.style.width = "100%";
        card.style.maxWidth = "480px";
        card.style.margin = "16px auto";
        card.style.padding = "14px 16px";
        card.style.borderRadius = "14px";
        card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.20)";
        card.style.background = "#fff";
        card.style.boxSizing = "border-box";

        card.style.opacity = "0";
        card.style.transform = "translateY(10px)";
        card.style.transition = "0.3s ease";

        const title = document.createElement("h3");
        title.textContent = "Weekly Activity (Mon–Fri)";
        title.style.fontSize = "16px";
        title.style.fontWeight = "700";
        title.style.marginBottom = "12px";

        card.appendChild(title);

        // =========================
        // WRAPPER
        // =========================
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.gap = "10px";
        wrapper.style.alignItems = "flex-end";

        // =========================
        // AXIS
        // =========================
        const axis = document.createElement("div");
        axis.style.display = "flex";
        axis.style.flexDirection = "column";
        axis.style.justifyContent = "space-between";
        axis.style.height = "120px";
        axis.style.fontSize = "11px";
        axis.style.color = "#666";
        axis.style.paddingRight = "6px";

        [10, 8, 6, 4, 2, 0].forEach(v => {
            const el = document.createElement("div");
            el.textContent = v + "h";
            axis.appendChild(el);
        });

        // =========================
    // BARS
    // =========================
    const bars = document.createElement("div");
    bars.style.display = "flex";
    bars.style.justifyContent = "space-between";
    bars.style.alignItems = "flex-end";
    bars.style.height = "120px";
    bars.style.flex = "1";
    bars.style.overflow = "hidden";

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
        col.style.height = "120px";

        const bar = document.createElement("div");

        const height = Math.min((value / maxHours) * maxBarHeight, maxBarHeight);

        // =========================
        // SMART COLOR GRADING
        // =========================
        let color = "#e0e0e0";

        if (value >= 9) color = "#1b5e20";       // dark green
        else if (value >= 8) color = "#4caf50";  // green
        else if (value >= 6) color = "#ffb300";  // yellow
        else if (value > 0) color = "#f44336";   // red

        bar.style.width = "14px";
        bar.style.height = "0px";
        bar.style.background = color;
        bar.style.borderRadius = "6px";
        bar.style.transition = "height 0.7s ease";
        bar.style.cursor = "pointer";

        bar.style.minHeight = "6px";

        // =========================
        // TOOLTIP 
        // =========================
        bar.addEventListener("mouseenter", () => {

            if (!logs.length) {
                tooltip.style.opacity = "1";
                tooltip.innerHTML = `
                    <b>${label}</b><br>
                    No record
                `;
                return;
            }

            const d = logs[0];

            tooltip.style.opacity = "1";
            tooltip.innerHTML = `
                <b>${label}</b><br>
                AM: ${d.am_in} → ${d.am_out}<br>
                PM: ${d.pm_in} → ${d.pm_out}<br>
                <b>Total: ${value.toFixed(2)} hrs</b>
            `;
        });

        bar.addEventListener("mousemove", (e) => {
            tooltip.style.left = e.pageX + 10 + "px";
            tooltip.style.top = e.pageY + 10 + "px";
        });

        bar.addEventListener("mouseleave", () => {
            tooltip.style.opacity = "0";
        });

        const text = document.createElement("span");
        text.textContent = label;
        text.style.fontSize = "12px";
        text.style.marginTop = "6px";
        text.style.color = "#555";

        col.appendChild(bar);
        col.appendChild(text);
        bars.appendChild(col);

        // =========================
        // ANIMATION
        // =========================
        setTimeout(() => {
            bar.style.height = value > 0 ? height + "px" : "6px";
        }, 300 + (i * 80));

    });

        // =========================
        // ASSEMBLE
        // =========================
        wrapper.appendChild(axis);
        wrapper.appendChild(bars);
        card.appendChild(wrapper);

        mount.parentNode.insertBefore(card, mount);

        // =========================
        // SHOW CARD
        // =========================
        requestAnimationFrame(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        });

    });