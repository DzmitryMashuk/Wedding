// Бабочка летит по дорожке программы: прокрутка страницы двигает её
// сверху вниз, а по горизонтали она следует за изгибами дорожки.

// Середина дорожки в пикселях исходной картинки program_path.webp (444×964).
// y строго растёт, поэтому точку на дорожке можно искать по высоте.
const PATH_IMAGE_WIDTH = 444;
const PATH_IMAGE_HEIGHT = 964;
const PATH_POINTS = [
  [216, 152], [245, 180], [280, 205], [298, 232], [292, 258], [265, 282],
  [235, 305], [200, 330], [178, 355], [170, 385], [178, 415], [199, 440],
  [228, 465], [253, 490], [275, 515], [291, 540], [285, 575], [268, 600],
  [250, 625], [225, 650], [198, 675], [172, 700], [160, 730], [165, 760],
  [180, 790], [205, 812], [240, 830], [265, 833],
];

// На какой высоте экрана (доля от высоты окна) должно быть начало дорожки,
// чтобы бабочка взлетела, и конец дорожки, чтобы она долетела
const START_ANCHOR = 0.8;
const END_ANCHOR = 0.55;
// Плавность догоняния: чем меньше, тем мягче движение
const EASING = 0.12;
const MAX_TILT_DEG = 30;

const pathImage = document.querySelector(".program__path");
const butterfly = document.querySelector(".program__butterfly");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const current = { y: PATH_POINTS[0][1] };
let frame = null;

function pointAtY(y) {
  const last = PATH_POINTS.length - 1;
  if (y <= PATH_POINTS[0][1]) return { x: PATH_POINTS[0][0], y: PATH_POINTS[0][1], index: 0 };
  if (y >= PATH_POINTS[last][1]) return { x: PATH_POINTS[last][0], y: PATH_POINTS[last][1], index: last - 1 };

  let i = 0;
  while (PATH_POINTS[i + 1][1] < y) i++;
  const [x1, y1] = PATH_POINTS[i];
  const [x2, y2] = PATH_POINTS[i + 1];
  const t = (y - y1) / (y2 - y1);
  return { x: x1 + (x2 - x1) * t, y, index: i };
}

// Прогресс полёта от 0 до 1. Старт — начало дорожки на высоте START_ANCHOR.
// Финиш — конец дорожки на высоте END_ANCHOR, но не позже конца страницы,
// иначе в последней секции бабочка не успела бы долететь.
function targetY() {
  const startY = PATH_POINTS[0][1];
  const endY = PATH_POINTS[PATH_POINTS.length - 1][1];
  const rect = pathImage.getBoundingClientRect();
  const scale = rect.height / PATH_IMAGE_HEIGHT;
  const pageTop = rect.top + window.scrollY;

  const scrollStart =
    pageTop + startY * scale - window.innerHeight * START_ANCHOR;
  const maxScroll =
    document.documentElement.scrollHeight - window.innerHeight;
  const scrollEnd = Math.min(
    pageTop + endY * scale - window.innerHeight * END_ANCHOR,
    maxScroll,
  );

  const progress = (window.scrollY - scrollStart) / (scrollEnd - scrollStart);
  return startY + (endY - startY) * progress;
}

function render() {
  const target = targetY();
  const clamped = Math.min(
    Math.max(target, PATH_POINTS[0][1]),
    PATH_POINTS[PATH_POINTS.length - 1][1],
  );

  current.y = reduceMotion.matches
    ? clamped
    : current.y + (clamped - current.y) * EASING;

  const point = pointAtY(current.y);
  const [x1, y1] = PATH_POINTS[point.index];
  const [x2, y2] = PATH_POINTS[point.index + 1];
  const tilt = Math.max(
    -MAX_TILT_DEG,
    Math.min(MAX_TILT_DEG, (Math.atan2(x2 - x1, y2 - y1) * 180) / Math.PI / 2),
  );

  const scale = pathImage.offsetWidth / PATH_IMAGE_WIDTH;
  const left = pathImage.offsetLeft + point.x * scale;
  const top = pathImage.offsetTop + point.y * scale;
  butterfly.style.transform =
    `translate(${left}px, ${top}px) translate(-50%, -50%) rotate(${tilt}deg)`;

  if (Math.abs(clamped - current.y) > 0.5) {
    frame = requestAnimationFrame(render);
  } else {
    frame = null;
  }
}

function schedule() {
  if (frame === null) frame = requestAnimationFrame(render);
}

window.addEventListener("scroll", schedule, { passive: true });
window.addEventListener("resize", schedule);
pathImage.addEventListener("load", schedule);
schedule();
