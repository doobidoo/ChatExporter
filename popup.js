document.getElementById('exportBtn').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('chat.openai.com') && !tab.url.includes('claude.ai')) {
      statusEl.textContent = 'Please open ChatGPT or Claude to export chat';
      return;
    }

    statusEl.textContent = 'Exporting...';
    
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'export' });
    
    if (response.success) {
      const blob = new Blob([response.markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `chat-export-${timestamp}.md`;
      
      await chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
      });
      
      statusEl.textContent = 'Export successful!';
    } else {
      statusEl.textContent = 'Export failed. Please try again.';
    }
  } catch (error) {
    statusEl.textContent = 'An error occurred. Please try again.';
    console.error(error);
  }
});