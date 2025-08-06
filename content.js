// Gmail POP3 Check Button Content Script
(function() {
    'use strict';

    // Wait for Gmail to fully load
    function waitForGmailLoad() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                const gmailHeader = document.querySelector('[role="banner"]') || 
                                 document.querySelector('.gb_yc') ||
                                 document.querySelector('[data-testid="gmail-logo"]');
                
                if (gmailHeader && document.readyState === 'complete') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 500);
        });
    }

    // Create the POP3 check button
    function createPOP3Button() {
        const button = document.createElement('button');
        button.id = 'pop3-check-button';
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Check POP3 Mail
        `;
        button.className = 'pop3-check-btn';
        button.title = 'Check mail from POP3 accounts';
        
        button.addEventListener('click', handlePOP3Check);
        
        return button;
    }

    // Handle the POP3 check button click
    async function handlePOP3Check() {
        const button = document.getElementById('pop3-check-button');
        const originalText = button.innerHTML;
        
        // Show loading state
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="spinning">
                <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
            </svg>
            Checking...
        `;
        button.disabled = true;

        try {
            // Navigate to the accounts settings page
            await navigateToAccountsSettings();
            
            // Wait a moment for the page to load
            setTimeout(() => {
                triggerPOP3Check();
                
                // Restore button state
                button.innerHTML = originalText;
                button.disabled = false;
                
                // Navigate back to inbox
                setTimeout(() => {
                    window.location.href = 'https://mail.google.com/mail/u/0/#inbox';
                }, 1000);
            }, 2000);
            
        } catch (error) {
            console.error('Error checking POP3 mail:', error);
            button.innerHTML = originalText;
            button.disabled = false;
            
            // Show error notification
            showNotification('Error checking POP3 mail. Please try again.', 'error');
        }
    }

    // Listen for messages from background script
    const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
    if (browserAPI && browserAPI.runtime && browserAPI.runtime.onMessage) {
        browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'triggerPOP3Check') {
                handlePOP3Check();
                sendResponse({ success: true });
            } else if (message.action === 'autoTriggerPOP3Check') {
                handlePOP3Check();
            }
            return true;
        });
    }

    // Navigate to accounts and import settings
    function navigateToAccountsSettings() {
        return new Promise((resolve) => {
            const settingsUrl = 'https://mail.google.com/mail/u/0/#settings/accounts';
            
            if (window.location.href !== settingsUrl) {
                window.location.href = settingsUrl;
                
                // Wait for navigation
                const checkNavigation = setInterval(() => {
                    if (window.location.href.includes('settings/accounts')) {
                        clearInterval(checkNavigation);
                        resolve();
                    }
                }, 500);
            } else {
                resolve();
            }
        });
    }

    // Trigger the POP3 check by finding and clicking the "Check mail now" button
    function triggerPOP3Check() {
        // Look for the "Check mail now" button in the accounts settings
        const checkButtons = document.querySelectorAll('input[type="button"], button, [role="button"]');
        
        for (const button of checkButtons) {
            const buttonText = button.textContent || button.value || button.getAttribute('aria-label') || '';
            if (buttonText.toLowerCase().includes('check mail now') || 
                buttonText.toLowerCase().includes('check mail') ||
                buttonText.toLowerCase().includes('refresh')) {
                button.click();
                showNotification('POP3 mail check initiated!', 'success');
                return;
            }
        }
        
        // Alternative: look for elements that might contain the check mail functionality
        const spans = document.querySelectorAll('span, div');
        for (const span of spans) {
            if (span.textContent && span.textContent.toLowerCase().includes('check mail now')) {
                const clickableParent = span.closest('[role="button"], button, a');
                if (clickableParent) {
                    clickableParent.click();
                    showNotification('POP3 mail check initiated!', 'success');
                    return;
                }
            }
        }
        
        showNotification('Could not find POP3 check button. Please check your settings.', 'warning');
    }

    // Show notification to user
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `pop3-notification pop3-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Insert the button into Gmail's interface
    function insertButton() {
        // Remove existing button if it exists
        const existingButton = document.getElementById('pop3-check-button');
        if (existingButton) {
            existingButton.remove();
        }

        // Try to find Gmail's toolbar
        const toolbar = document.querySelector('[role="toolbar"]') ||
                       document.querySelector('.ar9.T-I-J3.J-J5-Ji') ||
                       document.querySelector('.G-Ni.J-J5-Ji') ||
                       document.querySelector('[data-testid="toolbar"]');

        if (toolbar) {
            const button = createPOP3Button();
            toolbar.appendChild(button);
            return true;
        }

        // Alternative: insert in the header area
        const header = document.querySelector('[role="banner"]') ||
                      document.querySelector('.gb_yc');
        
        if (header) {
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'pop3-button-container';
            buttonContainer.appendChild(createPOP3Button());
            header.appendChild(buttonContainer);
            return true;
        }

        return false;
    }

    // Initialize the extension
    async function init() {
        try {
            await waitForGmailLoad();
            
            // Insert button initially
            insertButton();
            
            // Re-insert button when Gmail navigation occurs (SPA behavior)
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && 
                        !document.getElementById('pop3-check-button')) {
                        setTimeout(insertButton, 1000);
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
        } catch (error) {
            console.error('Failed to initialize Gmail POP3 extension:', error);
        }
    }

    // Start the extension
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();