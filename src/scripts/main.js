const ADVICE_API_URL = "https://api.adviceslip.com";
const LOADING_MESSAGE = "Loading advice...";
const FALLBACK_MESSAGE = "Unable to load advice right now, so remember: Keep it simple.";

function updateBlockquote(text, citeUrl) {
  const blockquoteEl = document.getElementById("advice");
  blockquoteEl.setAttribute("cite", citeUrl);
  blockquoteEl.textContent = text;
}

function showCitation(slipId, citeUrl) {
  const citationEl = document.getElementById("advice-citation");
  const link = citationEl.querySelector("a");
  link.href = citeUrl;
  link.textContent = `#${slipId}`;
  citationEl.style.visibility = "visible";
}

function hideCitation() {
  const citationEl = document.getElementById("advice-citation");
  citationEl.style.visibility = "hidden";
}

function renderAdvice(slip) {
  const citeUrl = slip.id ? `${ADVICE_API_URL}/advice/${slip.id}` : ADVICE_API_URL;

  updateBlockquote(slip.advice, citeUrl);

  if (slip.id) {
    showCitation(slip.id, citeUrl);
  } else {
    hideCitation();
  }
}

function renderLoading() {
  updateBlockquote(LOADING_MESSAGE, ADVICE_API_URL);
  hideCitation();
}

function renderFallback() {
  updateBlockquote(FALLBACK_MESSAGE, ADVICE_API_URL);
  hideCitation();
}

async function fetchAdvice() {
  const response = await fetch(`${ADVICE_API_URL}/advice`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  const data = await response.json();
  return data.slip;
}

async function loadAdvice() {
  renderLoading();

  try {
    const slip = await fetchAdvice();
    renderAdvice(slip);
  } catch (err) {
    renderFallback();
  }
}

const newAdviceBtn = document.getElementById("new-advice-btn");

const handleLoadAdvice = async () => {
  newAdviceBtn.disabled = true;
  await loadAdvice();
  newAdviceBtn.disabled = false;
};

handleLoadAdvice();

newAdviceBtn.addEventListener("click", handleLoadAdvice);
