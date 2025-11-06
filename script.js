const influencers = [
  {
    id: 'maya-lyn',
    name: 'Maya Lyn',
    niche: 'Beauty & Self-care',
    reach: '248K',
    engagement: '5.2%',
    status: 'new',
    location: 'Los Angeles, USA',
    platform: 'TikTok + Instagram',
    vibe: 'Glow-up routines, honest product reviews',
    bio: 'Former esthetician sharing approachable skincare rituals for busy founders.',
    lastMessage: 'Need to follow up with the updated UGC brief.',
  },
  {
    id: 'leo-park',
    name: 'Leo Park',
    niche: 'Lifestyle & Travel',
    reach: '412K',
    engagement: '4.1%',
    status: 'in progress',
    location: 'Austin, USA',
    platform: 'Instagram Reels',
    vibe: 'Slow travel, morning routines, mindful hustle',
    bio: 'Designing intentional travel experiences that fit remote founders.',
    lastMessage: 'Waiting on sample kit delivery confirmation.',
  },
  {
    id: 'sasha-fern',
    name: 'Sasha Fern',
    niche: 'Wellness & Mindfulness',
    reach: '198K',
    engagement: '6.8%',
    status: 'responded',
    location: 'Vancouver, CA',
    platform: 'YouTube + Newsletter',
    vibe: 'Breathwork, mindful journaling, cozy creator energy',
    bio: 'Guiding mindful rituals for creative entrepreneurs dealing with burnout.',
    lastMessage: 'Sent over revised talking points and pricing — awaiting confirmation.',
  },
  {
    id: 'noah-chen',
    name: 'Noah Chen',
    niche: 'Productivity & SaaS',
    reach: '320K',
    engagement: '4.9%',
    status: 'new',
    location: 'Singapore',
    platform: 'LinkedIn + Twitter',
    vibe: 'Founder-friendly productivity experiments & AI workflows',
    bio: 'Documenting automations that let bootstrapped teams scale without burnout.',
    lastMessage: 'New intro needed with mention of our influencer brief template.',
  },
];

const stats = {
  activeCampaigns: 12,
  messagesSent: 318,
  responseRate: 48,
};

const statusStyles = {
  new: {
    label: 'New',
    color: '#8d4bff',
  },
  'in progress': {
    label: 'In progress',
    color: '#f6c26b',
  },
  responded: {
    label: 'Responded',
    color: '#56f9c7',
  },
};

const tags = ['UGC priority', 'High affinity', 'Wellness', 'AI audience', '24h SLA'];

const state = {
  selectedInfluencer: null,
  generating: false,
  lastGeneratedPrompt: '',
};

const pipelineList = document.getElementById('pipelineList');
const pipelineTags = document.getElementById('pipelineTags');
const chatInfluencerName = document.getElementById('chatInfluencerName');
const chatInfluencerStatus = document.getElementById('chatInfluencerStatus');
const chatMeta = document.getElementById('chatMeta');
const chatWindow = document.getElementById('chatWindow');
const promptInput = document.getElementById('promptInput');
const aiStatus = document.getElementById('aiStatus');
const sendBtn = document.getElementById('sendBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const toolbarButtons = Array.from(document.querySelectorAll('.toolbar-btn'));

const messageTemplate = document.getElementById('messageTemplate');
const pipelineTemplate = document.getElementById('pipelineItemTemplate');

function formatTimestamp(date = new Date()) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function populateStats() {
  document.getElementById('activeCampaigns').textContent = stats.activeCampaigns;
  document.getElementById('messagesSent').textContent = stats.messagesSent;
  document.getElementById('responseRate').textContent = `${stats.responseRate}%`;
}

function createTagPills() {
  pipelineTags.innerHTML = '';
  tags.forEach((tag) => {
    const pill = document.createElement('span');
    pill.className = 'tag-pill';
    pill.textContent = `#${tag}`;
    pipelineTags.appendChild(pill);
  });
}

function renderPipeline() {
  pipelineList.innerHTML = '';
  influencers.forEach((influencer) => {
    const clone = pipelineTemplate.content.cloneNode(true);
    const article = clone.querySelector('.pipeline-item');
    article.dataset.id = influencer.id;

    if (state.selectedInfluencer?.id === influencer.id) {
      article.classList.add('active');
    }

    clone.querySelector('.pipeline-name').textContent = influencer.name;
    clone.querySelector('.pipeline-niche').textContent = influencer.niche;
    clone.querySelector('.stat-reach').textContent = influencer.reach;
    clone.querySelector('.stat-engagement').textContent = influencer.engagement;

    const statusPill = clone.querySelector('.status-pill');
    const statusInfo = statusStyles[influencer.status];
    statusPill.textContent = statusInfo.label;
    statusPill.style.color = statusInfo.color;
    statusPill.style.background = `${statusInfo.color}1f`;

    article.addEventListener('click', () => selectInfluencer(influencer.id));

    pipelineList.appendChild(clone);
  });
}

function selectInfluencer(id) {
  const influencer = influencers.find((item) => item.id === id);
  if (!influencer) return;

  state.selectedInfluencer = influencer;
  chatInfluencerName.textContent = influencer.name;
  chatInfluencerStatus.textContent = statusStyles[influencer.status].label;
  chatMeta.innerHTML = `
    <div><strong>Platform</strong><br />${influencer.platform}</div>
    <div><strong>Location</strong><br />${influencer.location}</div>
    <div><strong>Brand fit</strong><br />${influencer.vibe}</div>
    <div><strong>Latest note</strong><br />${influencer.lastMessage}</div>
  `;

  chatWindow.innerHTML = '';
  const intro = messageTemplate.content.cloneNode(true);
  intro.querySelector('.message-body').textContent = `Here\'s your workspace for ${influencer.name}. Bring in AGATHO AI to draft the next touchpoint when you\'re ready.`;
  intro.querySelector('.message-timestamp').textContent = formatTimestamp();
  chatWindow.appendChild(intro);

  promptInput.value = '';
  state.lastGeneratedPrompt = '';
  setToolbarActive('initial');
  renderPipeline();
  toolbarButtons.forEach((btn) => (btn.disabled = false));
  updateAIStatus('Ready to generate');
}

function updateAIStatus(text, loading = false) {
  aiStatus.textContent = text;
  aiStatus.classList.toggle('loading', loading);
  sendBtn.disabled = loading;
  regenerateBtn.disabled = loading;
  state.generating = loading;
}

function setToolbarActive(type) {
  toolbarButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });
}

function buildMessage(type, influencer, prompt) {
  const firstName = influencer.name.split(' ')[0];
  const baseIntro = `Hey ${firstName}!`;

  const promptAddition = prompt ? `\n\n${prompt.trim()}` : '';

  const messageBuilders = {
    initial: () => `${baseIntro} I lead partnerships at AGATHO, the AI assistant helping ${
      influencer.vibe.toLowerCase()
    }. We\'ve been obsessed with your ${influencer.niche.toLowerCase()} content—especially how you ${
      influencer.vibe.toLowerCase().split(',')[0]
    }. We\'re launching a dropship bundle that your community will love, and we can handle scripting, AI-assisted replies, and fulfillment so you stay in your creative flow.${promptAddition}\n\nOpen to a quick collab brainstorm? I can send a moodboard tailored to your style.`,
    followup: () => `${baseIntro} Circling back with the refreshed brief we mentioned. We added ${
      influencer.lastMessage.toLowerCase()
    } and mapped out deliverables that match your ${influencer.platform.toLowerCase()}. We can activate product samples this week and keep inbox replies handled by AGATHO so nothing slips through.${promptAddition}\n\nWould love to lock in the next step—does a 15-min sync tomorrow work?`,
    custom: () => `${baseIntro} ${prompt || 'Let\'s create something special for your audience.'}`,
  };

  return messageBuilders[type]();
}

function simulateGeneration(type) {
  if (!state.selectedInfluencer) {
    updateAIStatus('Pick a creator to generate messaging.');
    return;
  }

  const activeType = type || toolbarButtons.find((btn) => btn.classList.contains('active'))?.dataset.type;

  if (!activeType) return;

  const prompt = promptInput.value;
  const influencer = state.selectedInfluencer;

  updateAIStatus('AGATHO is crafting your message…', true);
  toolbarButtons.forEach((btn) => (btn.disabled = true));

  setTimeout(() => {
    const messageBody = buildMessage(activeType, influencer, prompt);
    promptInput.value = messageBody;
    state.lastGeneratedPrompt = messageBody;
    updateAIStatus('Draft ready — review & send');
    toolbarButtons.forEach((btn) => (btn.disabled = false));
  }, 1200 + Math.random() * 800);
}

function sendMessage() {
  if (!state.selectedInfluencer || !promptInput.value.trim()) return;

  const clone = messageTemplate.content.cloneNode(true);
  clone.querySelector('.message-body').textContent = promptInput.value.trim();
  clone.querySelector('.message-timestamp').textContent = formatTimestamp();
  chatWindow.appendChild(clone);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  updateAIStatus('Message logged to outreach flow');
}

function attachEventListeners() {
  toolbarButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setToolbarActive(btn.dataset.type);
      simulateGeneration(btn.dataset.type);
    });
  });

  regenerateBtn.addEventListener('click', () => simulateGeneration());
  sendBtn.addEventListener('click', sendMessage);

  promptInput.addEventListener('input', () => {
    if (state.generating) return;
    const baseline = (state.lastGeneratedPrompt ?? '').trim();
    if (promptInput.value.trim() !== baseline) {
      updateAIStatus('Edited — ready to send');
    } else {
      updateAIStatus('Draft ready — review & send');
    }
  });
}

populateStats();
createTagPills();
renderPipeline();
attachEventListeners();
