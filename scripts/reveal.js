const REVEAL_SELECTOR = [
  ".hero__monogram",
  ".hero__tagline",
  ".hero__title",
  ".hero__subtitle",
  ".invitation__title",
  ".invitation__text",
  ".calendar__month",
  ".calendar__grid",
  ".location__title",
  ".location__venue",
  ".location__type",
  ".location__link",
  ".program__title",
  ".program__item",
  ".dresscode__title",
  ".dresscode__subtitle",
  ".dresscode__text",
  ".dresscode__palette",
  ".wishes__title",
  ".wishes__text",
  ".wishes__sprig",
  ".rsvp__title",
  ".rsvp__intro",
  ".rsvp__field",
  ".rsvp__submit",
  ".contacts__title",
  ".contacts__text",
  ".contacts__button",
  ".countdown__title",
  ".countdown__wrap",
].join(", ");

const STAGGER_SECONDS = 0.15;

const elements = document.querySelectorAll(REVEAL_SELECTOR);
elements.forEach((el) => el.classList.add("reveal"));

const observer = new IntersectionObserver(
  (entries) => {
    entries
      .filter((entry) => entry.isIntersecting)
      .forEach((entry, index) => {
        entry.target.style.setProperty(
          "--reveal-delay",
          `${index * STAGGER_SECONDS}s`,
        );
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
  },
  { threshold: 0.2 },
);

elements.forEach((el) => observer.observe(el));
