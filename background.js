// Gmail POP3 Check Extension Background Script
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Gmail POP3 Check Extension installed');
        
        // Set default settings
        chrome.storage.sync.set({
            autoCheckInterval: 0, // 0 means disabled
            showNotifications: true,
            buttonPosition: 'toolbar'
        });
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // Check if we're on Gmail
    if (tab.url && tab.url.includes('mail.google.com')) {
        // Inject the content script if not already present
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
    } else {
        // Open Gmail if not already there
        chrome.tabs.create({
            url: 'https://mail.google.com'
        });
    }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkPOP3Status') {
        // This could be expanded to track POP3 check status
        sendResponse({ status: 'ready' });
    } else if (request.action === 'openSettings') {
        // Open extension settings page
        chrome.runtime.openOptionsPage();
    }
    
    return true; // Keep message channel open for async response
});

// Optional: Auto-check functionality (if user enables it)
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'autoCheckPOP3') {
        // Find Gmail tabs and trigger POP3 check
        chrome.tabs.query({ url: '*://mail.google.com/*' }, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { action: 'autoTriggerPOP3Check' });
            });
        });
    }
});

// Handle storage changes (for settings updates)
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes.autoCheckInterval) {
        const newInterval = changes.autoCheckInterval.newValue;
        
        // Clear existing alarm
        chrome.alarms.clear('autoCheckPOP3');
        
        // Set new alarm if interval > 0
        if (newInterval > 0) {
            chrome.alarms.create('autoCheckPOP3', {
                delayInMinutes: newInterval,
                periodInMinutes: newInterval
            });
        }
    }
});

// Context menu integration (optional)
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'checkPOP3Mail',
        title: 'Check POP3 Mail',
        contexts: ['page'],
        documentUrlPatterns: ['*://mail.google.com/*']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'checkPOP3Mail') {
        chrome.tabs.sendMessage(tab.id, { action: 'triggerPOP3Check' });
    }
});

// Keep service worker alive (for better reliability)
let keepAliveInterval;

function keepAlive() {
    if (keepAliveInterval) clearInterval(keepAliveInterval);
    keepAliveInterval = setInterval(() => {
        chrome.runtime.getPlatformInfo(() => {
            // This is just to keep the service worker active
        });
    }, 20000); // Every 20 seconds
}

keepAlive();

chrome.runtime.onStartup.addListener(keepAlive);
chrome.runtime.onInstalled.addListener(keepAlive);