/**
 * Chat Exporter Content Script
 * Extracts conversation content from ChatGPT and Claude interfaces
 */

// Log that the content script has loaded
console.log('Chat Exporter content script loaded on:', window.location.href);

function extractChatGPT() {
  console.log('Extracting ChatGPT conversation');
  
  // Debug DOM structure
  console.log('Document body:', document.body.innerHTML.substring(0, 500) + '...');
  
  // Try multiple selectors for different ChatGPT versions
  const selectors = [
    '[data-testid="conversation-turn"]',
    '.text-base',
    '.markdown',
    '.prose',
    '.chat-message',
    '.message-content',
    // Add more potential selectors
    '.message',
    '.conversation-turn',
    '[role="presentation"]'
  ];
  
  let elements = [];
  
  // Try each selector
  for (const selector of selectors) {
    console.log(`Trying selector: ${selector}`);
    const found = document.querySelectorAll(selector);
    if (found.length > 0) {
      console.log(`Found ${found.length} elements with selector: ${selector}`);
      elements = found;
      break;
    }
  }
  
  if (elements.length === 0) {
    console.error('No chat elements found with any selector');
    throw new Error('No chat messages found');
  }
  
  return extractFromElements(elements, 'ChatGPT');
}

function extractClaude() {
  console.log('Extracting Claude conversation');
  
  // Log the entire page structure for debugging
  console.log('Document body HTML:', document.body.innerHTML.substring(0, 1000) + '...');
  console.log('Document body text:', document.body.textContent.substring(0, 1000) + '...');
  
  // Try multiple selectors for different Claude versions
  const selectors = [
    // Original selectors
    '.message',
    '.chat-message',
    '.claude-message',
    '.message-content',
    '.conversation-message',
    '.chat-turn',
    '[data-message]',
    '.prose',
    '.content',
    
    // New selectors for Claude.ai
    '.cl-message',
    '.cl-message-container',
    '.cl-thread-message',
    '.cl-thread-message__content',
    '.cl-message-editor',
    '.cl-message-editor__content',
    '.cl-message-group',
    '.cl-message-status',
    '.cl-message-thread',
    '.cl-user-context-menu-target',
    '.cl-chat-message',
    '.cl-chat-message-container',
    '.cl-chat-turn',
    '.cl-chat-turn-container',
    '.cl-transcript',
    '.cl-transcript-container',
    '.cl-transcript-content',
    '.cl-transcript-message',
    '.cl-transcript-turn',
    
    // Generic selectors that might work
    'div[role="dialog"]',
    'div[role="main"]',
    'div[role="region"]',
    'div[role="list"]',
    'div[role="listitem"]',
    'article',
    'section',
    'main'
  ];
  
  let elements = [];
  
  // Try each selector
  for (const selector of selectors) {
    console.log(`Trying selector: ${selector}`);
    const found = document.querySelectorAll(selector);
    if (found.length > 0) {
      console.log(`Found ${found.length} elements with selector: ${selector}`);
      elements = found;
      break;
    }
  }
  
  // If no elements found with specific selectors, try a more aggressive approach
  if (elements.length === 0) {
    console.log('No elements found with specific selectors, trying fallback methods');
    
    // Try to find any div with substantial text content
    const allDivs = document.querySelectorAll('div');
    const textDivs = Array.from(allDivs).filter(div => {
      const text = div.textContent?.trim();
      return text && text.length > 100; // Only consider divs with substantial text
    });
    
    if (textDivs.length > 0) {
      console.log(`Found ${textDivs.length} divs with substantial text content`);
      elements = textDivs;
    } else {
      // Last resort: try to extract from the main content area
      const mainContent = document.querySelector('main') ||
                         document.querySelector('body') ||
                         document;
      
      // Create a virtual container with the entire content
      const container = document.createElement('div');
      container.innerHTML = mainContent.innerHTML;
      elements = [container];
      
      if (!mainContent) {
        console.error('No main content area found');
        throw new Error('No chat messages found');
      }
    }
  }
  
  if (elements.length === 0) {
    console.error('No chat elements found with any selector or fallback method');
    throw new Error('No chat messages found');
  }
  
  return extractFromElements(elements, 'Claude');
}

function extractFromThreads(threads, platform) {
  let markdown = `# ${platform} Conversation\n\nExported on ${new Date().toLocaleString()}\n\n`;
  
  threads.forEach((thread) => {
    try {
      const role = thread.querySelector('[data-testid="conversation-turn-header"]')?.textContent?.trim() || '';
      const content = thread.querySelector('[data-message-content], [data-message-author-role]')?.textContent?.trim() || '';
      
      if (!content) return;
      
      if (role.includes('ChatGPT') || role.includes('Assistant') || role.includes('Claude')) {
        markdown += `\n### Assistant:\n${content}\n`;
      } else {
        markdown += `\n### Human:\n${content}\n`;
      }
    } catch (error) {
      console.warn('Error extracting thread:', error);
    }
  });
  
  return markdown;
}

function extractFromElements(elements, platform) {
  let markdown = `# ${platform} Conversation\n\nExported on ${new Date().toLocaleString()}\n\n`;
  let currentRole = null;
  let messageCount = 0;
  let lastContent = '';
  
  console.log(`Extracting from ${elements.length} elements for ${platform}`);
  
  // For Claude, try to detect if we're in a specific type of view
  const isClaudeHistoricView = platform === 'Claude' &&
                              (window.location.href.includes('/chat/') ||
                               window.location.href.includes('/history/'));
  
  // Special handling for Claude historic view
  if (isClaudeHistoricView) {
    console.log('Detected Claude historic view, using specialized extraction');
    
    // Try to extract the title first
    const title = document.querySelector('h1, h2, h3')?.textContent?.trim();
    if (title) {
      markdown = `# ${title}\n\nExported from Claude on ${new Date().toLocaleString()}\n\n`;
    }
    
    // Try to find conversation elements with more specific Claude selectors
    const claudeMessages = document.querySelectorAll(
      '.cl-message, .cl-thread-message, .cl-chat-message, ' +
      '[data-message-id], [data-message-author], ' +
      '.message-container, .message-wrapper'
    );
    
    if (claudeMessages.length > 0) {
      console.log(`Found ${claudeMessages.length} Claude-specific message elements`);
      
      claudeMessages.forEach((msg, index) => {
        try {
          // Try to determine if this is a user or assistant message
          const isAssistant =
            msg.classList.contains('assistant') ||
            msg.classList.contains('claude') ||
            msg.classList.contains('bot') ||
            msg.getAttribute('data-message-author') === 'assistant' ||
            msg.querySelector('.assistant-indicator, .claude-indicator, .bot-indicator');
          
          const isUser =
            msg.classList.contains('user') ||
            msg.classList.contains('human') ||
            msg.getAttribute('data-message-author') === 'user' ||
            msg.querySelector('.user-indicator, .human-indicator');
          
          // Get the content
          const content = msg.textContent?.trim();
          if (!content || content === lastContent) return;
          lastContent = content;
          
          // Determine role
          const role = isAssistant ? 'Assistant' : (isUser ? 'Human' : (messageCount % 2 === 0 ? 'Human' : 'Assistant'));
          
          markdown += `\n### ${role}:\n${content}\n`;
          messageCount++;
        } catch (error) {
          console.warn(`Error extracting Claude message ${index}:`, error);
        }
      });
      
      if (messageCount > 0) {
        return markdown;
      }
    }
    
    // If we couldn't find specific message elements, try to parse the entire text
    console.log('Trying to parse entire text content for Claude');
    const fullText = document.body.textContent;
    if (fullText) {
      // Try to split by common patterns in Claude's interface
      const lines = fullText.split('\n').filter(line => line.trim().length > 0);
      
      let inMessage = false;
      let messageBuffer = '';
      let messageRole = '';
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip navigation, UI elements, etc.
        if (trimmedLine.includes('New chat') ||
            trimmedLine.includes('Settings') ||
            trimmedLine.includes('Log out') ||
            trimmedLine.length < 2) {
          continue;
        }
        
        // Try to detect role changes
        if (trimmedLine.includes('Claude:') ||
            trimmedLine.includes('Assistant:') ||
            trimmedLine.includes('Claude ') ||
            trimmedLine.includes('AI:')) {
          
          // If we were already in a message, save it
          if (inMessage && messageBuffer) {
            markdown += `\n### ${messageRole}:\n${messageBuffer.trim()}\n`;
          }
          
          inMessage = true;
          messageBuffer = trimmedLine.replace(/Claude:|Assistant:|Claude |AI:/g, '');
          messageRole = 'Assistant';
          
        } else if (trimmedLine.includes('You:') ||
                  trimmedLine.includes('Human:') ||
                  trimmedLine.includes('User:')) {
          
          // If we were already in a message, save it
          if (inMessage && messageBuffer) {
            markdown += `\n### ${messageRole}:\n${messageBuffer.trim()}\n`;
          }
          
          inMessage = true;
          messageBuffer = trimmedLine.replace(/You:|Human:|User:/g, '');
          messageRole = 'Human';
          
        } else if (inMessage) {
          // Continue adding to the current message
          messageBuffer += '\n' + trimmedLine;
        }
      }
      
      // Add the last message if there is one
      if (inMessage && messageBuffer) {
        markdown += `\n### ${messageRole}:\n${messageBuffer.trim()}\n`;
      }
      
      // If we extracted something, return it
      if (markdown.includes('Human:') || markdown.includes('Assistant:')) {
        return markdown;
      }
    }
  }
  
  // Standard extraction logic for all platforms
  elements.forEach((element, index) => {
    try {
      console.log(`Processing element ${index + 1}/${elements.length}`);
      
      // Try various role selectors
      const roleSelectors = [
        '.message-role', '.chat-role', '[data-message-author-role]',
        '.cl-message-role', '.cl-role', '.cl-author',
        '[data-testid*="role"]', '[data-testid*="author"]',
        '.user-name', '.assistant-name', '.bot-name'
      ];
      
      let role = null;
      for (const selector of roleSelectors) {
        const roleElement = element.querySelector(selector);
        if (roleElement) {
          role = roleElement.textContent?.trim();
          console.log(`Found role with selector ${selector}: "${role}"`);
          break;
        }
      }
      
      // Try various content selectors
      const contentSelectors = [
        '.message-content', '.chat-content', '.markdown', '.prose',
        '.cl-message-content', '.cl-content', '.cl-text',
        '[data-testid*="content"]', '[data-testid*="text"]',
        '.user-message', '.assistant-message', '.message-text'
      ];
      
      let content = null;
      for (const selector of contentSelectors) {
        const contentElement = element.querySelector(selector);
        if (contentElement) {
          content = contentElement.textContent?.trim();
          console.log(`Found content with selector ${selector}: "${content?.substring(0, 50)}..."`);
          break;
        }
      }
      
      // Fallback to the element's own text content
      if (!content) {
        content = element.textContent?.trim();
      }
      
      // Skip empty content or if it's the same as the last message (to avoid duplicates)
      if (!content || content === lastContent) return;
      lastContent = content;
      
      // Try to determine role from element classes if not found in child elements
      if (role) {
        currentRole = role.includes('Assistant') || role.includes('ChatGPT') ||
                     role.includes('Claude') || role.includes('AI') ||
                     role.includes('Bot') ? 'Assistant' : 'Human';
      } else if (element.classList.contains('assistant') ||
                element.classList.contains('bot') ||
                element.classList.contains('claude') ||
                element.classList.contains('ai')) {
        currentRole = 'Assistant';
      } else if (element.classList.contains('user') ||
                element.classList.contains('human') ||
                element.classList.contains('you')) {
        currentRole = 'Human';
      } else if (!currentRole) {
        // If we can't determine the role and don't have a previous one,
        // alternate based on message count (typically starts with human)
        currentRole = messageCount % 2 === 0 ? 'Human' : 'Assistant';
      }
      
      console.log(`Adding message as ${currentRole}: "${content.substring(0, 50)}..."`);
      markdown += `\n### ${currentRole}:\n${content}\n`;
      messageCount++;
      
      // Alternate roles if we're using the fallback pattern detection
      if (!role &&
          !element.classList.contains('assistant') &&
          !element.classList.contains('user') &&
          !element.classList.contains('claude') &&
          !element.classList.contains('human')) {
        currentRole = currentRole === 'Human' ? 'Assistant' : 'Human';
      }
    } catch (error) {
      console.warn('Error extracting message:', error);
    }
  });
  
  return markdown;
}

// Listen for export requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received export request:', request);
  console.log('Current URL:', window.location.href);
  console.log('Hostname:', window.location.hostname);
  
  if (request.action === 'export') {
    try {
      let markdown;
      
      // More flexible hostname checking
      if (window.location.hostname.includes('chat.openai.com') ||
          window.location.href.includes('chat.openai.com') ||
          window.location.hostname.includes('chatgpt.com') ||
          window.location.href.includes('chatgpt.com')) {
        console.log('Detected as ChatGPT');
        markdown = extractChatGPT();
      } else if (window.location.hostname.includes('claude.ai') ||
                window.location.href.includes('claude.ai')) {
        console.log('Detected as Claude');
        markdown = extractClaude();
      } else {
        console.error('Unsupported site:', window.location.hostname);
        throw new Error(`Unsupported site: ${window.location.hostname}`);
      }
      
      if (!markdown || markdown.trim() === '') {
        console.error('No content extracted');
        throw new Error('No content extracted');
      }
      
      console.log('Successfully extracted conversation');
      console.log('Markdown preview:', markdown.substring(0, 200) + '...');
      sendResponse({ success: true, markdown });
    } catch (error) {
      console.error('Export failed:', error);
      sendResponse({ success: false, error: error.message });
    }
  } else {
    console.log('Unknown action:', request.action);
    sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return true; // Keep the message channel open for async response
});