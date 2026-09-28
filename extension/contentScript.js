/**
 * GPT-PDF Studio — In-Page ChatGPT Bubble Selection & Export
 * Injected automatically on chatgpt.com and chat.openai.com
 */

(function () {
  let isSelectionMode = false;
  let selectedElements = new Set();

  function createFloatingBadge() {
    if (document.getElementById('gpt-pdf-trigger')) return;

    const btn = document.createElement('button');
    btn.id = 'gpt-pdf-trigger';
    btn.innerHTML = '⚡ <span>PDF Export</span>';
    btn.style.cssText = `
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 9999999;
      background: #090d16;
      color: #10b981;
      font-weight: 600;
      font-size: 13px;
      letter-spacing: -0.01em;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 10px 18px;
      border-radius: 999px;
      border: 1px solid rgba(16, 185, 129, 0.4);
      box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(16, 185, 129, 0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      backdrop-filter: blur(12px);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-2px) scale(1.03)';
      btn.style.borderColor = '#10b981';
      btn.style.boxShadow = '0 12px 36px rgba(0,0,0,0.7), 0 0 24px rgba(16, 185, 129, 0.3)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0) scale(1)';
      btn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      btn.style.boxShadow = '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(16, 185, 129, 0.15)';
    });

    btn.addEventListener('click', toggleSelectionMode);
    document.body.appendChild(btn);
  }

  function toggleSelectionMode() {
    isSelectionMode = !isSelectionMode;
    const btn = document.getElementById('gpt-pdf-trigger');

    if (isSelectionMode) {
      if (btn) {
        btn.innerHTML = '✓ <span>Done Selecting (0)</span>';
        btn.style.background = '#10b981';
        btn.style.color = '#090d16';
        btn.style.borderColor = '#10b981';
      }
      enableBubbleClicks();
    } else {
      if (btn) {
        btn.innerHTML = '⚡ <span>PDF Export</span>';
        btn.style.background = '#090d16';
        btn.style.color = '#10b981';
        btn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      }
      disableBubbleClicks();
      exportSelected();
    }
  }

  function updateCountBadge() {
    const btn = document.getElementById('gpt-pdf-trigger');
    if (btn && isSelectionMode) {
      btn.innerHTML = `✓ <span>Done Selecting (${selectedElements.size})</span>`;
    }
  }

  function enableBubbleClicks() {
    const bubbles = document.querySelectorAll('[data-message-author-role], article');
    bubbles.forEach((bubble) => {
      bubble.style.cursor = 'pointer';
      bubble.style.transition = 'outline 0.15s ease, background 0.15s ease';
      bubble.addEventListener('click', handleBubbleClick);
    });
  }

  function disableBubbleClicks() {
    const bubbles = document.querySelectorAll('[data-message-author-role], article');
    bubbles.forEach((bubble) => {
      bubble.removeEventListener('click', handleBubbleClick);
      bubble.style.outline = '';
      bubble.style.backgroundColor = '';
    });
  }

  function handleBubbleClick(e) {
    if (!isSelectionMode) return;
    e.stopPropagation();

    const target = this;
    if (selectedElements.has(target)) {
      selectedElements.delete(target);
      target.style.outline = '';
      target.style.backgroundColor = '';
    } else {
      selectedElements.add(target);
      target.style.outline = '2px solid #10b981';
      target.style.backgroundColor = 'rgba(16, 185, 129, 0.08)';
    }
    updateCountBadge();
  }

  function exportSelected() {
    const turns = [];
    const elementsToExport = selectedElements.size > 0 
      ? Array.from(selectedElements) 
      : Array.from(document.querySelectorAll('[data-message-author-role]'));

    elementsToExport.forEach((el) => {
      const role = el.getAttribute('data-message-author-role') || 
                   (el.innerText.includes('ChatGPT') ? 'assistant' : 'user');
      const markdownEl = el.querySelector('.markdown, [class*="markdown"], .whitespace-pre-wrap');
      const text = (markdownEl ? markdownEl.innerText : el.innerText) || '';
      if (text.trim()) {
        turns.push({ role, content: text });
      }
    });

    const payload = {
      title: document.title.replace(' - ChatGPT', '').trim() || 'ChatGPT Export',
      messages: turns,
      url: window.location.href,
      exportedAt: new Date().toISOString()
    };

    const json = JSON.stringify(payload, null, 2);

    navigator.clipboard.writeText(json).then(() => {
      alert(`Copied ${turns.length} message(s) to clipboard!\n\nOpen GPT-PDF Studio at http://localhost:8000 and click 'Import Raw / JSON' to preview & export your PDF.`);
    }).catch(() => {
      window.open('http://127.0.0.1:8000', '_blank');
    });

    selectedElements.clear();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    createFloatingBadge();
  } else {
    document.addEventListener('DOMContentLoaded', createFloatingBadge);
  }
})();
