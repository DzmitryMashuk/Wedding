// Бабочки в дресс-коде пролетают справа налево, пока секция прокручивается:
// влетают из-за правого края и к концу секции останавливаются в кадре.

// Для каждой бабочки: откуда и куда летит (vw, левый край бабочки), наклон (deg)
// и размах покачивания вверх-вниз (vw)
const FLIGHTS = [
  { selector: ".dresscode__butterfly--yellow", from: 105, to: 12, tilt: -15, bob: 5, waves: 2 },
  { selector: ".dresscode__butterfly--pastel", from: 140, to: 58, tilt: 12, bob: 4, waves: 3 },
];
// Плавность догоняния: чем меньше, тем мягче движение
const FLIGHT_EASING = 0.12;

const flightSection = document.querySelector(".dresscode");
const flyers = FLIGHTS.map((flight) => ({
  ...flight,
  el: document.querySelector(flight.selector),
}));
const flightReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let flightProgress = 0;
let flightFrame = null;

// 0 — секция только показалась снизу экрана, 1 — ушла наверх
// (или страница прокручена до конца, если секция последняя)
function targetProgress() {
  const rect = flightSection.getBoundingClientRect();
  const pageTop = rect.top + window.scrollY;
  const scrollStart = pageTop - window.innerHeight;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollEnd = Math.min(pageTop + rect.height, maxScroll);
  const progress = (window.scrollY - scrollStart) / (scrollEnd - scrollStart);
  return Math.min(Math.max(progress, 0), 1);
}

function renderFlight() {
  const target = targetProgress();
  flightProgress = flightReduceMotion.matches
    ? target
    : flightProgress + (target - flightProgress) * FLIGHT_EASING;

  const vw = window.innerWidth / 100;
  flyers.forEach(({ el, from, to, tilt, bob, waves }) => {
    const x = from + (to - from) * flightProgress;
    const wave = Math.sin(flightProgress * Math.PI * 2 * waves);
    const y = wave * bob;
    const rotate = tilt + wave * 8;
    el.style.transform =
      `translate(${x * vw}px, ${y * vw}px) rotate(${rotate}deg)`;
  });

  if (Math.abs(target - flightProgress) > 0.001) {
    flightFrame = requestAnimationFrame(renderFlight);
  } else {
    flightFrame = null;
  }
}

function scheduleFlight() {
  if (flightFrame === null) flightFrame = requestAnimationFrame(renderFlight);
}

window.addEventListener("scroll", scheduleFlight, { passive: true });
window.addEventListener("resize", scheduleFlight);
scheduleFlight();
