const ADVICE_API_URL = "https://api.adviceslip.com";

class AdviceRenderer {
  constructor() {
    this.LOADING_MESSAGE = "Loading advice...";
    this.FALLBACK_MESSAGE = "Unable to load advice right now, so remember: Keep it simple.";

    this.adviceEl = document.getElementById("advice");
    this.citationEl = document.getElementById("advice-citation");
    this.citationLinkEl = this.citationEl.querySelector("a");
  }

  updateBlockquote(text, citeUrl) {
    this.adviceEl.setAttribute("cite", citeUrl);
    this.adviceEl.textContent = text;
  }

  showCitation(slipId, citeUrl) {
    this.citationLinkEl.href = citeUrl;
    this.citationLinkEl.textContent = `#${slipId}`;
    this.citationEl.style.visibility = "visible";
  }

  hideCitation() {
    this.citationEl.style.visibility = "hidden";
  }

  showAdvice(slip) {
    const citeUrl = slip.id ? `${ADVICE_API_URL}/advice/${slip.id}` : ADVICE_API_URL;

    this.updateBlockquote(slip.advice, citeUrl);

    if (slip.id) {
      this.showCitation(slip.id, citeUrl);
    } else {
      this.hideCitation();
    }
  }

  showLoading() {
    this.updateBlockquote(this.LOADING_MESSAGE, ADVICE_API_URL);
    this.hideCitation();
  }

  showFallback() {
    this.updateBlockquote(this.FALLBACK_MESSAGE, ADVICE_API_URL);
    this.hideCitation();
  }
}

const renderer = new AdviceRenderer();
const newAdviceBtn = document.getElementById("new-advice-btn");

async function fetchAdvice() {
  const response = await fetch(`${ADVICE_API_URL}/advice`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  const data = await response.json();
  return data.slip;
}

async function loadAdvice() {
  renderer.showLoading();

  try {
    const slip = await fetchAdvice();
    renderer.showAdvice(slip);
  } catch (err) {
    renderer.showFallback();
  }
}

const handleLoadAdvice = async () => {
  newAdviceBtn.disabled = true;
  await loadAdvice();
  newAdviceBtn.disabled = false;
};

handleLoadAdvice();

newAdviceBtn.addEventListener("click", handleLoadAdvice);
