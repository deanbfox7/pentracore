const SYSTEM_PROMPT = `You are the AI Secretary for PentraCore International, an African minerals sourcing and trading company. Your role is to support the sales team as a knowledgeable, professional, and confident assistant.

COMPANY OVERVIEW:
- Company: PentraCore International
- Mission: Transform Africa's mineral wealth into global prosperity by connecting ethically sourced minerals from Africa to international buyers
- USP: Ethical sourcing, established African supply chains, transparent operations, competitive pricing

COMMODITIES WE TRADE:
- Gold (West & Central Africa) — artisanal and large-scale, ethically certified
- Chrome Ore (Zimbabwe, South Africa) — high-grade, for ferrochrome production
- Copper (DRC, Zambia Copper Belt) — cathodes and concentrates, EV/renewable demand
- Manganese (South Africa, Gabon) — steel and EV battery applications
- Iron Ore (Guinea, Sierra Leone, Liberia) — high-grade, emerging West African supply
- Coal (Mozambique, Zimbabwe, South Africa) — thermal and coking, India/Asia Pacific markets

TARGET MARKETS:
- Asia (China, India, Japan, South Korea) — primary buyers for chrome, iron ore, coal, copper
- Europe (Germany, Netherlands, UK) — focus on ethical sourcing compliance, ESG-aligned buyers
- Middle East (UAE, Saudi Arabia) — gold and investment interest
- Americas (USA, Brazil) — copper, critical minerals for EV and tech industries

TONE & STYLE:
- Professional, confident, and knowledgeable
- Direct and results-oriented
- Trustworthy — always emphasise ethical sourcing and transparency
- Adapt tone to the audience (more formal for investors, more commercial for traders)

When generating emails, proposals, or follow-ups: be specific, compelling, and professional. Always position PentraCore as a reliable, ethical, and competitive partner.`;

let apiKey = localStorage.getItem('pentracore_api_key') || '';
let chatHistory = [];

function init() {
  if (apiKey) {
    document.getElementById('apiKeyInput').value = apiKey;
    document.getElementById('keyStatus').textContent = 'Key saved ✓';
    document.getElementById('keyStatus').className = 'text-xs mt-1 text-green-400';
  }
  showPage('overview');
}

function saveApiKey() {
  const val = document.getElementById('apiKeyInput').value.trim();
  if (!val) return;
  apiKey = val;
  localStorage.setItem('pentracore_api_key', val);
  document.getElementById('keyStatus').textContent = 'Key saved ✓';
  document.getElementById('keyStatus').className = 'text-xs mt-1 text-green-400';
}

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById('page-' + page).classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('bg-gray-800', 'text-yellow-400');
    btn.classList.add('text-gray-300');
  });
  const active = document.querySelector(`[data-page="${page}"]`);
  if (active) {
    active.classList.add('bg-gray-800', 'text-yellow-400');
    active.classList.remove('text-gray-300');
  }
}

function checkKey() {
  if (!apiKey) {
    alert('Please paste your Anthropic API key in the sidebar first.');
    return false;
  }
  return true;
}

function showLoading(show) {
  document.getElementById('loading').classList.toggle('hidden', !show);
}

async function callClaude(messages, userSystemPrompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: userSystemPrompt || SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// AI Secretary Chat
async function sendChat() {
  if (!checkKey()) return;
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  input.value = '';
  appendChatMessage('user', msg);
  chatHistory.push({ role: 'user', content: msg });

  showLoading(true);
  try {
    const reply = await callClaude(chatHistory);
    chatHistory.push({ role: 'assistant', content: reply });
    appendChatMessage('assistant', reply);
  } catch (e) {
    appendChatMessage('assistant', `Error: ${e.message}`);
  } finally {
    showLoading(false);
  }
}

function appendChatMessage(role, text) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'flex gap-3';

  const avatar = document.createElement('div');
  avatar.className = role === 'user'
    ? 'w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 font-bold text-xs flex-shrink-0'
    : 'w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-xs flex-shrink-0';
  avatar.textContent = role === 'user' ? 'You' : 'AI';

  const bubble = document.createElement('div');
  bubble.className = 'bg-gray-800 rounded-lg px-4 py-3 text-sm text-gray-200 max-w-2xl whitespace-pre-wrap';
  bubble.textContent = text;

  div.appendChild(avatar);
  div.appendChild(bubble);
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

// Email Outreach
async function generateEmail() {
  if (!checkKey()) return;
  const recipient = document.getElementById('email-recipient').value.trim() || 'the decision maker';
  const company = document.getElementById('email-company').value.trim() || 'your organisation';
  const market = document.getElementById('email-market').value;
  const commodity = document.getElementById('email-commodity').value;
  const type = document.getElementById('email-type').value;

  const prompt = `Generate a professional cold outreach email from PentraCore International to ${recipient} at ${company}, a ${type} based in the ${market} market. The email is about sourcing ${commodity} from Africa through PentraCore. Make it concise, compelling, personalised, and professional. Include a clear subject line. End with a soft call to action (schedule a call or request more info).`;

  document.getElementById('email-output').textContent = 'Generating…';
  showLoading(true);
  try {
    const result = await callClaude([{ role: 'user', content: prompt }]);
    document.getElementById('email-output').textContent = result;
  } catch (e) {
    document.getElementById('email-output').textContent = `Error: ${e.message}`;
  } finally {
    showLoading(false);
  }
}

// Proposals & Pitches
async function generateProposal() {
  if (!checkKey()) return;
  const type = document.getElementById('proposal-type').value;
  const target = document.getElementById('proposal-target').value.trim() || 'the prospective partner';
  const commodity = document.getElementById('proposal-commodity').value;
  const volume = document.getElementById('proposal-volume').value.trim();
  const notes = document.getElementById('proposal-notes').value.trim();

  let prompt = `Generate a professional ${type} from PentraCore International to ${target} for ${commodity}.`;
  if (volume) prompt += ` Deal size/volume: ${volume}.`;
  if (notes) prompt += ` Key selling points to include: ${notes}.`;
  prompt += ` Make it structured, compelling, and professional. Include sections for introduction, offer/proposition, why PentraCore, terms overview, and next steps.`;

  document.getElementById('proposal-output').textContent = 'Generating…';
  showLoading(true);
  try {
    const result = await callClaude([{ role: 'user', content: prompt }]);
    document.getElementById('proposal-output').textContent = result;
  } catch (e) {
    document.getElementById('proposal-output').textContent = `Error: ${e.message}`;
  } finally {
    showLoading(false);
  }
}

// Follow-Up Scheduler
async function generateFollowUp() {
  if (!checkKey()) return;
  const recipient = document.getElementById('followup-recipient').value.trim() || 'the contact';
  const stage = document.getElementById('followup-stage').value;
  const context = document.getElementById('followup-context').value.trim();

  let prompt = `Generate a professional follow-up email from PentraCore International to ${recipient}. This is a ${stage}.`;
  if (context) prompt += ` Context: ${context}.`;
  prompt += ` Keep it concise, warm but professional, and end with a clear next step or call to action.`;

  document.getElementById('followup-output').textContent = 'Generating…';
  showLoading(true);
  try {
    const result = await callClaude([{ role: 'user', content: prompt }]);
    document.getElementById('followup-output').textContent = result;
  } catch (e) {
    document.getElementById('followup-output').textContent = `Error: ${e.message}`;
  } finally {
    showLoading(false);
  }
}

// Commodities Guide
function askAboutCommodity(commodity) {
  document.getElementById('commodity-question').value = `Tell me about the current market outlook and key buyers for ${commodity} from Africa.`;
  document.getElementById('commodity-question').focus();
}

async function askCommodityQuestion() {
  if (!checkKey()) return;
  const q = document.getElementById('commodity-question').value.trim();
  if (!q) return;

  const answerEl = document.getElementById('commodity-answer');
  answerEl.textContent = 'Thinking…';
  answerEl.classList.remove('hidden');
  showLoading(true);
  try {
    const result = await callClaude([{ role: 'user', content: q }]);
    answerEl.textContent = result;
  } catch (e) {
    answerEl.textContent = `Error: ${e.message}`;
  } finally {
    showLoading(false);
  }
}

function copyOutput(id) {
  const text = document.getElementById(id).textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied to clipboard!');
  });
}

init();
