/**
 * GPT-PDF — In-Page ChatGPT Selection Content Script
 * Allows users to select individual message bubbles directly inside ChatGPT.
 */

(function () {
  let isSelectionMode = false;
  const selectedElements = new Set<HTMLElement>();

  function createFloatingBadge() {
    if (document.getElementById('gpt-pdf-trigger')) return;

    const btn = document.createElement('button');
    btn.id = 'gpt-pdf-trigger';
    btn.textContent = '📄 PDF Export';
    btn.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: #10b981;
      color: #090d16;
      font-weight: 700;
      font-size: 13px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 8px 14px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.2);
      box-shadow: 0 4px 16px rgba(0,0,0,0.5);
      cursor: pointer;
      transition: transform 0.15s ease, background 0.15s ease;
    `;

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.05)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
    });

    btn.addEventListener('click', toggleSelectionMode);
    document.body.appendChild(btn);
  }

  function toggleSelectionMode() {
    isSelectionMode = !isSelectionMode;
    const btn = document.getElementById('gpt-pdf-trigger');

    if (isSelectionMode) {
      if (btn) {
        btn.textContent = '✓ Done Selecting';
        btn.style.background = '#34d399';
      }
      enableBubbleClicks();
    } else {
      if (btn) {
        btn.textContent = '📄 PDF Export';
        btn.style.background = '#10b981';
      }
      disableBubbleClicks();
      exportSelected();
    }
  }

  function enableBubbleClicks() {
    const bubbles = document.querySelectorAll<HTMLElement>('[data-message-author-role]');
    bubbles.forEach((bubble) => {
      bubble.style.cursor = 'pointer';
      bubble.style.transition = 'outline 0.15s ease, background 0.15s ease';
      bubble.addEventListener('click', handleBubbleClick);
    });
  }

  function disableBubbleClicks() {
    const bubbles = document.querySelectorAll<HTMLElement>('[data-message-author-role]');
    bubbles.forEach((bubble) => {
      bubble.removeEventListener('click', handleBubbleClick);
      bubble.style.outline = '';
    });
  }

  function handleBubbleClick(this: HTMLElement, e: MouseEvent) {
    if (!isSelectionMode) return;
    e.stopPropagation();

    if (selectedElements.has(this)) {
      selectedElements.delete(this);
      this.style.outline = '';
      this.style.backgroundColor = '';
    } else {
      selectedElements.add(this);
      this.style.outline = '2px solid #10b981';
      this.style.backgroundColor = 'rgba(16, 185, 129, 0.08)';
    }
  }

  function exportSelected() {
    if (selectedElements.size === 0) {
      // Export all if none selected
      const pageHtml = document.documentElement.outerHTML;
      navigator.clipboard.writeText(pageHtml).then(() => {
        alert('All conversation turns copied to clipboard! Paste into GPT-PDF Studio.');
      });
      return;
    }

    const turns: Array<{ role: string; content: string }> = [];
    selectedElements.forEach((el) => {
      const role = el.getAttribute('data-message-author-role') || 'assistant';
      const text = el.innerText || '';
      turns.push({ role, content: text });
    });

    const json = JSON.stringify({
      title: document.title.replace(' - ChatGPT', ''),
      messages: turns,
    });

    navigator.clipboard.writeText(json).then(() => {
      alert(`Copied ${turns.length} selected message(s) to clipboard! Paste into GPT-PDF Studio.`);
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    createFloatingBadge();
  } else {
    document.addEventListener('DOMContentLoaded', createFloatingBadge);
  }
})();
