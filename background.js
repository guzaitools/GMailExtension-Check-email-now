// Gmail POP3 Check Extension Background Script (Firefox)
// Use browser namespace for Firefox compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

browserAPI.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Gmail POP3 Check Extension installed');
        
        // Set default settings
        browserAPI.storage.sync.set({
            autoCheckInterval: 0, // 0 means disabled
            showNotifications: true,
            buttonPosition: 'toolbar'
        });
    }
});

// Handle extension icon click (Firefox uses browserAction)
if (browserAPI.browserAction) {
    browserAPI.browserAction.onClicked.addListener((tab) => {
        handleIconClick(tab);
    });
} else if (browserAPI.action) {
    // Fallback for Chrome
    browserAPI.action.onClicked.addListener((tab) => {
        handleIconClick(tab);
    });
}

function handleIconClick(tab) {
    // Check if we're on Gmail
    if (tab.url && tab.url.includes('mail.google.com')) {
        // Send message to content script to trigger check
        browserAPI.tabs.sendMessage(tab.id, { action: 'triggerPOP3Check' }).catch(() => {
            // Content script might not be loaded, reload the page
            browserAPI.tabs.reload(tab.id);
        });
    } else {
        // Open Gmail if not already there
        browserAPI.tabs.create({
            url: 'https://mail.google.com'
        });
    }
}

// Listen for messages from content script
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkPOP3Status') {
        // This could be expanded to track POP3 check status
        sendResponse({ status: 'ready' });
    } else if (request.action === 'openSettings') {
        // Open extension settings page (if available)
        if (browserAPI.runtime.openOptionsPage) {
            browserAPI.runtime.openOptionsPage();
        }
    }
    
    return true; // Keep message channel open for async response
});

// Optional: Auto-check functionality (if user enables it)
if (browserAPI.alarms) {
    browserAPI.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'autoCheckPOP3') {
            // Find Gmail tabs and trigger POP3 check
            browserAPI.tabs.query({ url: '*://mail.google.com/*' }, (tabs) => {
                tabs.forEach(tab => {
                    browserAPI.tabs.sendMessage(tab.id, { action: 'autoTriggerPOP3Check' });
                });
            });
        }
    });

    // Handle storage changes (for settings updates)
    browserAPI.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync' && changes.autoCheckInterval) {
            const newInterval = changes.autoCheckInterval.newValue;
            
            // Clear existing alarm
            browserAPI.alarms.clear('autoCheckPOP3');
            
            // Set new alarm if interval > 0
            if (newInterval > 0) {
                browserAPI.alarms.create('autoCheckPOP3', {
                    delayInMinutes: newInterval,
                    periodInMinutes: newInterval
                });
            }
        }
    });
}

// Context menu integration
browserAPI.runtime.onInstalled.addListener(() => {
    browserAPI.contextMenus.create({
        id: 'checkPOP3Mail',
        title: 'Check POP3 Mail',
        contexts: ['page'],
        documentUrlPatterns: ['*://mail.google.com/*']
    });
});

browserAPI.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'checkPOP3Mail') {
        browserAPI.tabs.sendMessage(tab.id, { action: 'triggerPOP3Check' });
    }
});