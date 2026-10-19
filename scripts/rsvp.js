// Анкета гостя: ответы отправляются сообщением в Telegram через бота.

// Токен виден любому, кто откроет код страницы, — см. пояснение в чате.
const TELEGRAM_BOT_TOKEN = "8781355147:AAG-Lx7aJbCf5DKtzZjeqLy4xvQa22d2oKM";
// ID чатов, куда бот присылает ответы: у каждого свой личный чат с ботом.
// Это НЕ ID бота: бот не может писать сам себе.
const TELEGRAM_CHAT_IDS = [
  "551802646", // Дима
  "819220759", // Даша
];

const rsvpForm = document.querySelector(".rsvp__form");
const attendingBlock = rsvpForm.querySelector(".rsvp__attending");
const partnerField = rsvpForm.querySelector(".rsvp__partner");
const rsvpError = rsvpForm.querySelector(".rsvp__error");
const rsvpThanks = rsvpForm.querySelector(".rsvp__thanks");
const rsvpSubmit = rsvpForm.querySelector(".rsvp__submit");

const RSVP_LABELS = {
  attendance: { yes: "Да, с удовольствием!", no: "К сожалению, не сможет" },
  company: { alone: "Один / одна", "plus-one": "Со спутником (+1)" },
  drinks: {
    "red-wine": "Вино красное",
    "white-wine": "Вино белое",
    sparkling: "Игристое",
    "whisky-cognac": "Виски / коньяк",
    vodka: "Водка",
    "non-alcoholic": "Безалкогольные напитки",
  },
  transfer: {
    "both-ways": "Туда и обратно",
    there: "Только туда",
    back: "Только обратно",
    none: "Доберётся сам(а)",
  },
};

// Скрытый блок выключаем, чтобы его поля не попали в ответ
function toggleBlock(block, visible) {
  block.hidden = !visible;
  block.querySelectorAll("input").forEach((input) => {
    input.disabled = !visible;
  });
}

function updateVisibility() {
  const attending = rsvpForm.elements.attendance.value === "yes";
  toggleBlock(attendingBlock, attending);
  toggleBlock(
    partnerField,
    attending && rsvpForm.elements.company.value === "plus-one",
  );
}

function collectAnswers() {
  const data = new FormData(rsvpForm);
  return {
    name: data.get("name").trim(),
    attendance: data.get("attendance"),
    company: data.get("company"),
    partner: data.get("partner")?.trim() || null,
    drinks: data.getAll("drinks"),
    transfer: data.get("transfer"),
    message: data.get("message").trim(),
  };
}

function formatMessage(answers) {
  const lines = [
    "💌 Новый ответ на анкету",
    "",
    `Имя: ${answers.name}`,
    `Придёт: ${RSVP_LABELS.attendance[answers.attendance]}`,
  ];

  if (answers.attendance === "yes") {
    if (answers.company) {
      lines.push(`Будет: ${RSVP_LABELS.company[answers.company]}`);
    }
    if (answers.partner) lines.push(`Спутник: ${answers.partner}`);
    if (answers.drinks.length) {
      const drinks = answers.drinks.map((d) => RSVP_LABELS.drinks[d]);
      lines.push(`Напитки: ${drinks.join(", ")}`);
    }
    if (answers.transfer) {
      lines.push(`Трансфер: ${RSVP_LABELS.transfer[answers.transfer]}`);
    }
  }

  if (answers.message) lines.push("", `Пожелания: ${answers.message}`);
  return lines.join("\n");
}

async function sendToChat(chatId, text) {
  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    },
  );
  const result = await response.json();
  if (!result.ok) throw new Error(`${chatId}: ${result.description}`);
}

// Ответ считается отправленным, если дошёл хотя бы в один чат
async function submitRsvp(answers) {
  const text = formatMessage(answers);
  const results = await Promise.allSettled(
    TELEGRAM_CHAT_IDS.map((chatId) => sendToChat(chatId, text)),
  );
  const failed = results.filter((r) => r.status === "rejected");
  failed.forEach((r) => console.error("Не доставлено:", r.reason));
  if (failed.length === results.length) throw failed[0].reason;
}

function showError(text) {
  rsvpError.textContent = text;
  rsvpError.hidden = false;
  rsvpThanks.hidden = true;
}

rsvpForm.addEventListener("change", () => {
  updateVisibility();
  rsvpError.hidden = true;
});

rsvpForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const answers = collectAnswers();

  if (!answers.name || !answers.attendance) {
    showError("Пожалуйста, укажите имя и ответьте, сможете ли прийти.");
    return;
  }

  if (answers.company === "plus-one" && !answers.partner) {
    showError("Пожалуйста, укажите имя и фамилию спутника.");
    return;
  }

  rsvpError.hidden = true;
  rsvpSubmit.disabled = true;
  rsvpSubmit.textContent = "Отправляем…";

  try {
    await submitRsvp(answers);
    rsvpForm.reset();
    updateVisibility();
    rsvpThanks.hidden = false;
  } catch (error) {
    console.error("Не удалось отправить анкету:", error);
    showError(
      "Не получилось отправить ответ. Попробуйте ещё раз или напишите нам в Telegram.",
    );
  } finally {
    rsvpSubmit.disabled = false;
    rsvpSubmit.textContent = "Отправить";
  }
});

updateVisibility();
