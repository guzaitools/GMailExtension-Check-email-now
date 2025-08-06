# Gmail POP3 Check Button Extension

A Chrome extension that adds a convenient button to Gmail for quickly checking POP3 email accounts, eliminating the need to manually navigate to settings every time.

## Features

- 🔘 **One-Click POP3 Check**: Add a button directly in Gmail to trigger POP3 mail checking
- 🎨 **Native Gmail Integration**: Button blends seamlessly with Gmail's interface
- 📱 **Responsive Design**: Works on desktop and mobile Gmail interfaces
- 🌙 **Dark Mode Support**: Automatically adapts to Gmail's dark theme
- 🔔 **Smart Notifications**: Visual feedback for check status and completion
- ⚡ **Fast Navigation**: Automatically returns you to your inbox after checking
- 🖱️ **Multiple Access Methods**: Button in toolbar, extension popup, and right-click context menu

## Installation

### From Source (Developer Mode)

1. **Download or Clone** this repository to your local machine
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** by toggling the switch in the top-right corner
4. **Click "Load unpacked"** and select the extension folder
5. **Grant Permissions** when prompted to access Gmail
6. **Navigate to Gmail** and look for the "Check POP3 Mail" button

### Prerequisites

- Google Chrome browser (version 88 or higher)
- Gmail account with POP3 accounts configured
- POP3 email accounts set up in Gmail Settings > Accounts and Import

## How to Use

### Method 1: In-Gmail Button
1. Open Gmail in your browser
2. Look for the **"Check POP3 Mail"** button in the toolbar area
3. Click the button to trigger POP3 checking
4. The extension will navigate to settings, trigger the check, and return you to inbox

### Method 2: Extension Popup
1. Click the extension icon in Chrome's toolbar
2. Click **"Check POP3 Mail Now"** in the popup
3. The check will be triggered automatically

### Method 3: Right-Click Context Menu
1. Right-click anywhere on a Gmail page
2. Select **"Check POP3 Mail"** from the context menu

## Setup Requirements

Before using this extension, ensure you have POP3 accounts configured in Gmail:

1. **Open Gmail Settings**:
   - Click the gear icon → "See all settings"
   - Go to "Accounts and Import" tab

2. **Add POP3 Account** (if not already done):
   - Scroll to "Check mail from other accounts"
   - Click "Add a mail account"
   - Follow the setup wizard for your POP3 email provider

3. **Verify Configuration**:
   - Ensure your POP3 accounts appear in the list
   - Test the "Check mail now" button manually first

## File Structure

```
gmail-pop3-checker/
├── manifest.json          # Extension configuration
├── content.js             # Injects button into Gmail
├── background.js          # Background service worker
├── popup.html             # Extension popup interface
├── popup.js               # Popup functionality
├── styles.css             # Button and notification styling
├── icons/                 # Extension icons (16x16 to 128x128)
├── README.md              # This documentation
└── read.me                # Original requirements
```

## Technical Details

### Permissions Used
- `activeTab`: Access to the currently active Gmail tab
- `scripting`: Inject content scripts into Gmail
- `https://mail.google.com/*`: Host permission for Gmail

### Browser Compatibility
- **Chrome**: Version 88+ (Manifest V3 support)
- **Edge**: Version 88+ (Chromium-based)
- **Other Browsers**: Not supported (Chrome extension specific)

### Security & Privacy
- Extension only accesses Gmail pages when active
- No data is stored or transmitted outside your browser
- All functionality happens locally in your browser
- No external API calls or data collection

## Troubleshooting

### Button Not Appearing
1. **Refresh Gmail**: Press F5 or reload the page
2. **Check Extension**: Ensure extension is enabled in `chrome://extensions/`
3. **Permissions**: Verify extension has permission to access Gmail
4. **Content Script**: Try clicking the extension icon to re-inject the script

### POP3 Check Not Working
1. **Verify POP3 Setup**: Check Gmail Settings > Accounts and Import
2. **Manual Test**: Try the "Check mail now" button manually in settings
3. **Account Status**: Ensure POP3 accounts are active and configured correctly
4. **Gmail Login**: Make sure you're logged into the correct Gmail account

### Extension Errors
1. **Console Logs**: Check browser console (F12) for error messages
2. **Reload Extension**: Disable and re-enable in `chrome://extensions/`
3. **Clear Cache**: Clear browser cache and cookies for Gmail
4. **Update Chrome**: Ensure you're using a recent version of Chrome

## Development

### Local Development
```bash
# Clone repository
git clone <repository-url>
cd gmail-pop3-checker

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select this directory
```

### Making Changes
1. Edit source files as needed
2. Go to `chrome://extensions/`
3. Click the refresh icon for this extension
4. Test changes in Gmail

### Build for Production
The extension is ready to use as-is. For distribution:
1. Create extension icons (16, 32, 48, 128 pixel sizes)
2. Test thoroughly across different Gmail interfaces
3. Package as .crx file or submit to Chrome Web Store

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with different Gmail configurations
5. Submit a pull request

## License

This project is open source. Feel free to modify and distribute according to your needs.

## Changelog

### Version 1.0.0
- Initial release
- Basic POP3 check functionality
- Gmail toolbar integration
- Extension popup interface
- Context menu support
- Responsive design and dark mode support

## Support

If you encounter issues:

1. **Check Prerequisites**: Ensure POP3 accounts are configured in Gmail
2. **Review Troubleshooting**: Follow the troubleshooting guide above
3. **Browser Console**: Check for JavaScript errors in browser console
4. **Extension Console**: Check extension console in `chrome://extensions/`

## Future Enhancements

Potential features for future versions:
- [ ] Configurable auto-check intervals
- [ ] Multiple Gmail account support
- [ ] Advanced notification options
- [ ] Settings page for customization
- [ ] Keyboard shortcuts
- [ ] Check status indicators
- [ ] Email count displays