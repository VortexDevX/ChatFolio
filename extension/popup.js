document.getElementById('openStudio').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:8000' });
});

document.getElementById('selectBubbles').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const btn = document.getElementById('gpt-pdf-trigger');
        if (btn) btn.click();
      }
    });
  }
});

document.getElementById('copyJson').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const turns = [];
        document.querySelectorAll('[data-message-author-role]').forEach((el) => {
          const role = el.getAttribute('data-message-author-role') || 'assistant';
          const text = el.innerText || '';
          if (text.trim()) turns.push({ role, content: text });
        });
        const json = JSON.stringify({
          title: document.title.replace(' - ChatGPT', '').trim(),
          messages: turns,
          url: window.location.href
        }, null, 2);
        navigator.clipboard.writeText(json).then(() => {
          alert(`Copied ${turns.length} messages to clipboard! Now paste into GPT-PDF Studio.`);
        });
      }
    });
  }
});
