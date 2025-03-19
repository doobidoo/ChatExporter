function extractChatGPT() {
  const threads = document.querySelectorAll('[data-testid="conversation-turn"]');
  let markdown = '# ChatGPT Conversation\n\n';
  
  threads.forEach((thread) => {
    const role = thread.querySelector('[data-testid="conversation-turn-header"]')?.textContent || '';
    const content = thread.querySelector('[data-message-content]')?.textContent || '';
    
    if (role.includes('ChatGPT')) {
      markdown += `\n### Assistant:\n${content}\n`;
    } else {
      markdown += `\n### Human:\n${content}\n`;
    }
  });
  
  return markdown;
}

function extractClaude() {
  const messages = document.querySelectorAll('.message');
  let markdown = '# Claude Conversation\n\n';
  
  messages.forEach((message) => {
    const role = message.querySelector('.message-role')?.textContent || '';
    const content = message.querySelector('.message-content')?.textContent || '';
    
    if (role.includes('Assistant')) {
      markdown += `\n### Assistant:\n${content}\n`;
    } else {
      markdown += `\n### Human:\n${content}\n`;
    }
  });
  
  return markdown;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'export') {
    try {
      let markdown;
      
      if (window.location.hostname === 'chat.openai.com') {
        markdown = extractChatGPT();
      } else if (window.location.hostname === 'claude.ai') {
        markdown = extractClaude();
      }
      
      sendResponse({ success: true, markdown });
    } catch (error) {
      console.error('Export failed:', error);
      sendResponse({ success: false });
    }
  }
  return true;
});