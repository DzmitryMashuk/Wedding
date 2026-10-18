// Таймер до свадьбы. Дата и время — в атрибуте data-date у .countdown__timer.

const countdownTimer = document.querySelector(".countdown__timer");
const weddingTime = new Date(countdownTimer.dataset.date).getTime();
const countdownValues = {};
countdownTimer.querySelectorAll("[data-unit]").forEach((el) => {
  countdownValues[el.dataset.unit] = el;
});

const pad = (value) => String(value).padStart(2, "0");

function updateCountdown() {
  // После начала праздника таймер остаётся на нулях
  const left = Math.max(0, weddingTime - Date.now());
  const totalSeconds = Math.floor(left / 1000);

  countdownValues.days.textContent = pad(Math.floor(totalSeconds / 86400));
  countdownValues.hours.textContent = pad(Math.floor(totalSeconds / 3600) % 24);
  countdownValues.minutes.textContent = pad(Math.floor(totalSeconds / 60) % 60);
  countdownValues.seconds.textContent = pad(totalSeconds % 60);
}

updateCountdown();
setInterval(updateCountdown, 1000);
