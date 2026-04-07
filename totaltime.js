window.addEventListener("DOMContentLoaded", async () => {

    const userDocId = localStorage.getItem("userDocId");
    if (!userDocId) return;

    const total = await getTotalRecordedHours(userDocId);

    document.getElementById("totalHours").textContent =
        total.toFixed(2) + " hrs";

    const userDoc = await db.collection("users").doc(userDocId).get();
    const data = userDoc.data();
    const targetHours = data.target_hours || 0;

    const remaining = Math.max(targetHours - total, 0);

    const hoursPerDay = 8;
    const daysNeeded = Math.ceil(remaining / hoursPerDay);

    const today = new Date();

    function addWorkDays(startDate, days) {
        let date = new Date(startDate);

        while (days > 0) {
            date.setDate(date.getDate() + 1);

            const day = date.getDay();

            if (day !== 0 && day !== 6) {
            days--;
            }
        }

        return date;
        }

    const finishDate = addWorkDays(new Date(), daysNeeded);

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = finishDate.toLocaleDateString(undefined, options);

    document.getElementById("finishDate").textContent = formattedDate;

});