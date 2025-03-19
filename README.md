# Chat Exporter

A browser extension that allows you to export conversations from ChatGPT and Claude.ai to Markdown format.

![Chat Exporter Logo](icons/icon128.png)

## Features

- Export ChatGPT conversations to Markdown
- Export Claude.ai conversations to Markdown
- Clean, formatted output with proper conversation structure
- One-click export with automatic file naming
- Works with both free and paid versions of ChatGPT and Claude

## Installation

### Chrome Web Store (Recommended)

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore/category/extensions) (link will be updated once published)
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation (Developer Mode)

1. Download the latest release from the [Releases page](https://github.com/yourusername/chat-exporter/releases) or clone this repository
2. Unzip the file (if downloaded as a zip)
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" using the toggle in the top-right corner
5. Click "Load unpacked" and select the `dist` directory from the unzipped folder
6. The extension should now appear in your extensions list and be ready to use

## Usage

1. Navigate to [ChatGPT](https://chat.openai.com/) or [Claude.ai](https://claude.ai/)
2. Start or continue a conversation
3. Click the Chat Exporter icon in your browser toolbar
4. Click the "Export Chat" button
5. Choose where to save the Markdown file
6. Your conversation is now saved as a Markdown file!

## Troubleshooting

- **Extension shows "Please open ChatGPT or Claude to export chat"**: Make sure you're on a ChatGPT or Claude.ai page with an active conversation.
- **No chat messages found**: Try refreshing the page and trying again. If the issue persists, please report it as an issue.
- **Export failed**: Check the console logs for more details (right-click > Inspect > Console) and report the issue with these logs.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/chat-exporter.git
   cd chat-exporter
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the extension:
   ```
   npm run build:extension
   ```

4. Load the extension in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` directory

### Development Commands

- `npm run build:extension` - Build the extension
- `npm run package` - Build and package the extension as a zip file

## License

### Commercial License

This software is available under a commercial license. For pricing and licensing information, please contact [your email or contact information].

Copyright © 2025 [Your Name or Company]. All rights reserved.

The commercial license grants you the right to use, modify, and distribute this software as part of your commercial products, subject to the terms and conditions of the license agreement.

### Alternative Open Source License Options

If you prefer to release this as open source, consider one of these licenses:

#### MIT License (Most Permissive)
Allows commercial use, modification, distribution, and private use with minimal restrictions. Users can do almost anything with the code but must include the original license and copyright notice.

#### Mozilla Public License 2.0 (Moderate)
A "weak copyleft" license that allows commercial use but requires modifications to the licensed files to be released under the same license. Other components can be under different licenses.

#### GNU General Public License v3 (Strong Copyleft)
Requires that any distributed work based on the software must be released under the same license. This includes modifications and larger works that incorporate the software.

## Privacy Policy

Chat Exporter does not collect or transmit any user data. All conversation exports are processed locally on your device and are only saved to your computer when you explicitly choose to download them.

## Support

For support, feature requests, or bug reports, please [open an issue](https://github.com/yourusername/chat-exporter/issues) on our GitHub repository.

---

Made with ❤️ by [Your Name or Company]