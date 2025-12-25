const ADVICE_API_URL = "https://api.adviceslip.com";
const LOADING_MESSAGE = "Loading advice...";
const FALLBACK_MESSAGE = "Unable to load advice right now, so remember: Keep it simple.";

const adviceEl = document.getElementById("advice");
const citationEl = document.getElementById("advice-citation");
const citationLinkEl = citationEl.querySelector("a");
const newAdviceBtn = document.getElementById("new-advice-btn");

function updateBlockquote(text, citeUrl) {
  adviceEl.setAttribute("cite", citeUrl);
  adviceEl.textContent = text;
}

function showCitation(slipId, citeUrl) {
  citationLinkEl.href = citeUrl;
  citationLinkEl.textContent = `#${slipId}`;
  citationEl.style.visibility = "visible";
}

function hideCitation() {
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

const handleLoadAdvice = async () => {
  newAdviceBtn.disabled = true;
  await loadAdvice();
  newAdviceBtn.disabled = false;
};

handleLoadAdvice();

newAdviceBtn.addEventListener("click", handleLoadAdvice);
