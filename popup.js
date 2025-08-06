// Gmail POP3 Checker Popup Script (Firefox)
// Use browser namespace for Firefox compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

document.addEventListener('DOMContentLoaded', function() {
    const openGmailBtn = document.getElementById('open-gmail');
    const checkPOP3Btn = document.getElementById('check-pop3');
    const settingsBtn = document.getElementById('settings');
    const helpLink = document.getElementById('help-link');
    const statusDiv = document.getElementById('status');

    // Check if we're currently on Gmail
    checkGmailTab();

    // Event listeners
    openGmailBtn.addEventListener('click', openGmail);
    checkPOP3Btn.addEventListener('click', triggerPOP3Check);
    settingsBtn.addEventListener('click', openSettings);
    helpLink.addEventListener('click', showHelp);

    function checkGmailTab() {
        browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            
            if (currentTab && currentTab.url && currentTab.url.includes('mail.google.com')) {
                checkPOP3Btn.disabled = false;
                showStatus('Ready to check POP3 mail', 'success');
                openGmailBtn.textContent = 'Refresh Gmail';
            } else {
                checkPOP3Btn.disabled = true;
                showStatus('Open Gmail to use POP3 check', 'info');
                openGmailBtn.textContent = 'Open Gmail';
            }
        });
    }

    function openGmail() {
        browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            
            if (currentTab && currentTab.url && currentTab.url.includes('mail.google.com')) {
                // Refresh current Gmail tab
                browserAPI.tabs.reload(currentTab.id);
            } else {
                // Open new Gmail tab
                browserAPI.tabs.create({ url: 'https://mail.google.com' });
            }
            
            window.close();
        });
    }

    function triggerPOP3Check() {
        checkPOP3Btn.disabled = true;
        checkPOP3Btn.textContent = 'Checking...';
        showStatus('Triggering POP3 check...', 'info');

        browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            
            if (currentTab && currentTab.url && currentTab.url.includes('mail.google.com')) {
                // Send message to content script to trigger POP3 check
                const sendMessage = browserAPI.tabs.sendMessage(currentTab.id, { 
                    action: 'triggerPOP3Check' 
                });

                // Handle both Promise-based (Firefox) and callback-based (Chrome) APIs
                if (sendMessage && sendMessage.then) {
                    // Firefox Promise-based API
                    sendMessage.then(() => {
                        checkPOP3Btn.disabled = false;
                        checkPOP3Btn.textContent = 'Check POP3 Mail Now';
                        showStatus('POP3 check initiated!', 'success');
                        
                        setTimeout(() => {
                            window.close();
                        }, 1500);
                    }).catch((error) => {
                        // Content script might not be loaded, refresh page
                        browserAPI.tabs.reload(currentTab.id);
                        window.close();
                    });
                } else {
                    // Chrome callback-based API
                    setTimeout(() => {
                        if (browserAPI.runtime.lastError) {
                            // Content script might not be loaded, refresh page
                            browserAPI.tabs.reload(currentTab.id);
                        } else {
                            showStatus('POP3 check initiated!', 'success');
                        }
                        
                        checkPOP3Btn.disabled = false;
                        checkPOP3Btn.textContent = 'Check POP3 Mail Now';
                        
                        setTimeout(() => {
                            window.close();
                        }, 1500);
                    }, 100);
                }
            } else {
                checkPOP3Btn.disabled = false;
                checkPOP3Btn.textContent = 'Check POP3 Mail Now';
                showStatus('Please open Gmail first', 'info');
            }
        });
    }

    function openSettings() {
        // For now, just show an alert. In a full implementation, 
        // this would open an options page
        alert('Settings feature coming soon!\n\nFor now, you can:\n- Click the extension icon to open this popup\n- Use the "Check POP3 Mail Now" button when on Gmail\n- Right-click on Gmail pages for context menu');
    }

    function showHelp(e) {
        e.preventDefault();
        const helpText = `Gmail POP3 Checker Help:

1. Open Gmail in your browser
2. Click the extension icon or use the "Check POP3 Mail Now" button
3. The extension will navigate to your account settings and trigger a POP3 check
4. You'll return to your inbox automatically

Requirements:
- You must have POP3 accounts configured in Gmail settings
- The extension needs permission to access Gmail

Troubleshooting:
- Make sure you're logged into Gmail
- Check that POP3 accounts are properly configured in Gmail settings
- Try refreshing the Gmail page if the button doesn't appear`;

        alert(helpText);
    }

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.classList.remove('hidden');
        
        // Hide status after 3 seconds
        setTimeout(() => {
            statusDiv.classList.add('hidden');
        }, 3000);
    }
});