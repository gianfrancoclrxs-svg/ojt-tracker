const ACC_ANIM_DELAY = 150;

document.addEventListener("DOMContentLoaded", async () => {

  const userDocId = localStorage.getItem("userDocId");
  if (!userDocId) return;

  const isDarkMode = () => document.body.classList.contains("dark-mode");

  const getTheme = () => ({
    cardBg: isDarkMode() ? "#1e1e1e" : "#fff",
    text: isDarkMode() ? "#eaeaea" : "#222",
    muted: isDarkMode() ? "#aaaaaa" : "#777",
    border: isDarkMode() ? "#333" : "#e5e5e5"
  });

  const card = document.getElementById("todayAccomplishmentCard");
  const textEl = document.getElementById("todayAccomplishmentText");

  const btn = document.getElementById("editAccomplishmentBtn");
  const historyBtn = document.getElementById("viewAccomplishmentHistoryBtn");

  const modal = document.getElementById("accomModal");
  const input = document.getElementById("accomInput");
  const saveBtn = document.getElementById("accomSave");
  const cancelBtn = document.getElementById("accomCancel");
  const overlay = document.getElementById("accomModalOverlay");
  const dateInput = document.getElementById("accomDate");

  const today = () => new Date().toISOString().split("T")[0];

  const applyTheme = () => {
    const t = getTheme();

    if (!card) return;

    card.style.background = t.cardBg;
    card.style.color = t.text;
    card.style.border = `1px solid ${t.border}`;
    card.style.borderRadius = "14px";
    card.style.padding = "16px";
    card.style.margin = "16px auto";
    card.style.maxWidth = "480px";
    card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";

    if (textEl) {
      textEl.style.color = t.muted;
      textEl.style.fontSize = "14px";
      textEl.style.marginTop = "6px";
    }

    if (btn) {
      btn.style.marginTop = "10px";
      btn.style.padding = "10px 12px";
      btn.style.borderRadius = "10px";
      btn.style.border = "none";
      btn.style.cursor = "pointer";
      btn.style.fontWeight = "700";
      btn.style.background = "#4caf50";
      btn.style.color = "#fff";
    }

    if (historyBtn) {
      historyBtn.style.marginTop = "6px";
      historyBtn.style.padding = "10px 12px";
      historyBtn.style.borderRadius = "10px";
      historyBtn.style.border = "none";
      historyBtn.style.cursor = "pointer";
      historyBtn.style.fontWeight = "700";
      historyBtn.style.background = "#2196f3";
      historyBtn.style.color = "#fff";
    }
  };

  applyTheme();

  document.addEventListener("DOMContentLoaded", applyTheme);

  const observer = new MutationObserver(applyTheme);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });

  async function loadAccomplishment(date = today()) {

    const doc = await db.collection("users")
      .doc(userDocId)
      .collection("daily_accomplishments")
      .doc(date)
      .get();

    if (doc.exists && doc.data().text) {
      textEl.textContent = doc.data().text;
    } else {
      textEl.textContent = "No accomplishment yet";
    }
  }

  function openModal(text = "") {
    input.value = text === "No accomplishment yet" ? "" : text;
    dateInput.value = today();
    modal.style.display = "block";
  }

  function closeModal() {
    modal.style.display = "none";
  }

  btn?.addEventListener("click", () => {
    openModal(textEl.textContent);
  });

  historyBtn?.addEventListener("click", () => {
    window.location.href = "accomplishment.html";
  });

  cancelBtn?.addEventListener("click", closeModal);
  overlay?.addEventListener("click", closeModal);

  saveBtn?.addEventListener("click", async () => {

    const value = input.value.trim();
    const selectedDate = dateInput.value;

    if (!value || !selectedDate) return;

    saveBtn.textContent = "Saving...";
    saveBtn.disabled = true;

    await db.collection("users")
      .doc(userDocId)
      .collection("daily_accomplishments")
      .doc(selectedDate)
      .set({
        text: value,
        date: selectedDate,
        updatedAt: Date.now()
      });

    saveBtn.textContent = "Save";
    saveBtn.disabled = false;

    closeModal();
    loadAccomplishment(selectedDate);
  });

  setTimeout(() => {
    loadAccomplishment();
  }, ACC_ANIM_DELAY);

});