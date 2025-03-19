// Log that the popup script has loaded
console.log('Chat Exporter popup script loaded');

// Enable debug mode for development
const DEBUG_MODE = true;

// Helper function to log to both console and debug div
function debugLog(message, type = 'info') {
  console[type](message);
  
  if (DEBUG_MODE) {
    const debugEl = document.getElementById('debug');
    if (debugEl) {
      debugEl.style.display = 'block';
      const logItem = document.createElement('div');
      logItem.textContent = `[${type}] ${message}`;
      logItem.style.color = type === 'error' ? '#dc2626' : '#666';
      debugEl.appendChild(logItem);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  debugLog('DOM content loaded');
  
  const exportBtn = document.getElementById('exportBtn');
  const statusEl = document.getElementById('status');
  const debugEl = document.getElementById('debug');
  
  if (!exportBtn) {
    debugLog('Export button not found', 'error');
    return;
  }
  
  if (!statusEl) {
    debugLog('Status element not found', 'error');
    return;
  }

  // Add version info to the popup
  const versionEl = document.createElement('div');
  versionEl.className = 'version';
  versionEl.textContent = 'v1.0.0';
  document.body.appendChild(versionEl);
  
  // Show browser info in debug
  if (DEBUG_MODE && debugEl) {
    const browserInfo = `Browser: ${navigator.userAgent}`;
    debugLog(browserInfo);
  }

  exportBtn.addEventListener('click', async () => {
    debugLog('Export button clicked');
    statusEl.textContent = '';
    statusEl.className = 'status';
    
    try {
      // Get the active tab
      debugLog('Querying for active tab');
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tabs || tabs.length === 0) {
        throw new Error('No active tab found');
      }
      
      const tab = tabs[0];
      debugLog(`Current tab URL: ${tab.url}`);
      
      // Check if we're on a supported site
      const isChatGPT = tab.url.includes('chat.openai.com') || tab.url.includes('chatgpt.com');
      const isClaude = tab.url.includes('claude.ai');
      
      debugLog(`URL check: ChatGPT=${isChatGPT}, Claude=${isClaude}`);
      
      if (!isChatGPT && !isClaude) {
        statusEl.textContent = 'Please open ChatGPT or Claude to export chat';
        statusEl.className = 'status error';
        debugLog('Not on a supported site', 'warn');
        return;
      }
  
      debugLog(`Detected site: ${isChatGPT ? 'ChatGPT' : 'Claude'}`);
      statusEl.textContent = 'Exporting...';
      
      // Inject content script if needed
      try {
        debugLog('Checking if content script needs to be injected');
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // This is just a check to see if we can execute in the page
            return true;
          }
        });
        debugLog('Content script check successful');
      } catch (err) {
        debugLog(`Error checking content script: ${err.message}`, 'error');
        // Continue anyway, the message sending will fail if there's a real problem
      }
      
      // Attempt to send message to content script with timeout
      debugLog('Sending message to content script');
      const response = await Promise.race([
        chrome.tabs.sendMessage(tab.id, {
          action: 'export',
          site: isChatGPT ? 'chatgpt' : 'claude'
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Content script not responding')), 8000)
        )
      ]);
      
      debugLog(`Received response: ${JSON.stringify(response).substring(0, 100)}...`);
      
      if (response?.success) {
        const markdownPreview = response.markdown.substring(0, 50) + '...';
        debugLog(`Markdown content: ${markdownPreview}`);
        
        const blob = new Blob([response.markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const siteName = isChatGPT ? 'chatgpt' : 'claude';
        const filename = `${siteName}-export-${timestamp}.md`;
        
        debugLog(`Downloading file: ${filename}`);
        await chrome.downloads.download({
          url: url,
          filename: filename,
          saveAs: true
        });
        
        statusEl.textContent = 'Export successful!';
        statusEl.className = 'status success';
        debugLog('Export completed successfully');
      } else {
        debugLog('Invalid response from content script', 'error');
        throw new Error(response?.error || 'Export failed - no valid response from content script');
      }
    } catch (error) {
      debugLog(`Export error: ${error.message}`, 'error');
      statusEl.className = 'status error';
      
      if (error.message.includes('Could not establish connection')) {
        statusEl.textContent = 'Error: Please refresh the page and try again';
      } else if (error.message.includes('Content script not responding')) {
        statusEl.textContent = 'Error: Extension not ready. Please refresh the page.';
      } else {
        statusEl.textContent = `Error: ${error.message || 'Export failed. Please try again.'}`;
      }
    }
  });
});