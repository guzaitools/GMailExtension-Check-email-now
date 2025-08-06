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
            console.log('Starting POP3 check process...');
            
            // Navigate to the accounts settings page
            await navigateToAccountsSettings();
            
            console.log('Navigation complete, waiting for page to load...');
            
            // Wait longer for the page to fully load and render
            setTimeout(() => {
                console.log('Page should be loaded, triggering POP3 check...');
                triggerPOP3Check();
                
                // Wait a bit before restoring button state to see if check worked
                setTimeout(() => {
                    // Restore button state
                    button.innerHTML = originalText;
                    button.disabled = false;
                    
                    console.log('POP3 check process complete, returning to inbox...');
                    
                    // Navigate back to inbox
                    setTimeout(() => {
                        window.location.href = 'https://mail.google.com/mail/u/0/#inbox';
                    }, 2000);
                }, 3000);
            }, 3000);
            
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
            
            console.log('Current URL:', window.location.href);
            console.log('Target URL:', settingsUrl);
            
            if (!window.location.href.includes('settings/accounts')) {
                console.log('Navigating to accounts settings...');
                window.location.href = settingsUrl;
                
                // Wait for navigation
                const checkNavigation = setInterval(() => {
                    console.log('Checking navigation... Current URL:', window.location.href);
                    
                    if (window.location.href.includes('settings/accounts')) {
                        console.log('Navigation complete!');
                        clearInterval(checkNavigation);
                        
                        // Wait a bit more for the page content to load
                        setTimeout(() => {
                            resolve();
                        }, 1500);
                    }
                }, 500);
                
                // Fallback timeout
                setTimeout(() => {
                    console.log('Navigation timeout, proceeding anyway...');
                    clearInterval(checkNavigation);
                    resolve();
                }, 10000);
            } else {
                console.log('Already on accounts settings page');
                resolve();
            }
        });
    }

    // Trigger the POP3 check by finding and clicking the "Check mail now" button
    function triggerPOP3Check() {
        console.log('Starting POP3 check detection...');
        
        // Wait for page to fully load
        setTimeout(() => {
            // Try multiple strategies to find the check mail button
            let found = false;
            
            // Strategy 1: Look for specific Gmail button patterns
            const possibleSelectors = [
                'input[value*="Check mail now"]',
                'input[value*="check mail"]',
                'button[title*="Check mail"]',
                'button[aria-label*="Check mail"]',
                '[data-tooltip*="check mail"]',
                'input[type="button"][value="Check mail now"]',
                'input[type="submit"][value*="Check"]'
            ];
            
            for (const selector of possibleSelectors) {
                const elements = document.querySelectorAll(selector);
                console.log(`Trying selector: ${selector}, found ${elements.length} elements`);
                
                for (const element of elements) {
                    if (element.offsetParent !== null) { // Check if visible
                        console.log('Found visible check button:', element);
                        
                        // Try to trigger the click with multiple methods
                        element.click();
                        
                        // Also try dispatching a click event
                        const clickEvent = new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        element.dispatchEvent(clickEvent);
                        
                        // Verify the check was triggered
                        setTimeout(() => {
                            verifyPOP3Check();
                        }, 2000);
                        
                        showNotification('POP3 mail check initiated!', 'success');
                        found = true;
                        return;
                    }
                }
            }
            
            // Strategy 2: Text-based search in all clickable elements
            if (!found) {
                console.log('Trying text-based search...');
                const clickableElements = document.querySelectorAll('input, button, [role="button"], a, span[onclick], div[onclick]');
                
                for (const element of clickableElements) {
                    const text = (element.textContent || element.value || element.title || element.getAttribute('aria-label') || '').toLowerCase();
                    
                    if ((text.includes('check mail') && text.includes('now')) || 
                        text === 'check mail now' ||
                        (text.includes('check') && text.includes('mail') && element.type === 'button')) {
                        
                        console.log('Found check button by text:', element, 'Text:', text);
                        
                        // Make sure it's visible
                        if (element.offsetParent !== null && !element.disabled) {
                            console.log('Clicking button:', element);
                            
                            // Try multiple click methods
                            element.click();
                            element.dispatchEvent(new MouseEvent('click', {
                                bubbles: true,
                                cancelable: true,
                                view: window
                            }));
                            
                            // Try focus + enter for input elements
                            if (element.tagName === 'INPUT') {
                                element.focus();
                                element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
                            }
                            
                            setTimeout(() => verifyPOP3Check(), 2000);
                            showNotification('POP3 mail check initiated!', 'success');
                            found = true;
                            return;
                        }
                    }
                }
            }
            
            // Strategy 3: Look in specific Gmail settings sections
            if (!found) {
                console.log('Trying section-based search...');
                
                // Look for the "Check mail from other accounts" section
                const sections = document.querySelectorAll('tr, .Ze, .aAv, .aAt');
                
                for (const section of sections) {
                    const sectionText = section.textContent || '';
                    
                    if (sectionText.includes('Check mail from other accounts') || 
                        sectionText.includes('POP3') ||
                        sectionText.includes('other accounts')) {
                        
                        console.log('Found POP3 section:', section);
                        
                        // Look for buttons within this section
                        const buttonsInSection = section.querySelectorAll('input[type="button"], input[type="submit"], button');
                        
                        for (const button of buttonsInSection) {
                            const buttonText = (button.value || button.textContent || '').toLowerCase();
                            
                            if (buttonText.includes('check') || buttonText.includes('refresh') || buttonText.includes('now')) {
                                console.log('Found button in POP3 section:', button);
                                button.click();
                                showNotification('POP3 mail check initiated!', 'success');
                                found = true;
                                return;
                            }
                        }
                    }
                }
            }
            
            // Strategy 4: Look for forms and submit the right one
            if (!found) {
                console.log('Trying form-based search...');
                const forms = document.querySelectorAll('form');
                
                for (const form of forms) {
                    const formText = form.textContent || '';
                    
                    if (formText.includes('Check mail from other accounts') || formText.includes('POP3')) {
                        const submitButtons = form.querySelectorAll('input[type="submit"], input[type="button"], button');
                        
                        for (const button of submitButtons) {
                            const buttonText = (button.value || button.textContent || '').toLowerCase();
                            
                            if (buttonText.includes('check') && !buttonText.includes('delete') && !buttonText.includes('edit')) {
                                console.log('Found form submit button:', button);
                                button.click();
                                showNotification('POP3 mail check initiated!', 'success');
                                found = true;
                                return;
                            }
                        }
                    }
                }
            }
            
            if (!found) {
                console.log('Could not find check mail button. Available buttons:');
                const allButtons = document.querySelectorAll('input[type="button"], input[type="submit"], button');
                allButtons.forEach((btn, index) => {
                    console.log(`Button ${index}:`, btn, 'Text:', btn.textContent || btn.value, 'Visible:', btn.offsetParent !== null);
                });
                
                showNotification('Could not find POP3 check button. Make sure POP3 accounts are configured.', 'warning');
            }
        }, 1000); // Wait 1 second for page to load
    }

    // Verify that the POP3 check actually happened
    function verifyPOP3Check() {
        console.log('Verifying POP3 check...');
        
        // Look for signs that the check is happening
        const indicators = [
            // Loading indicators
            'div[role="progressbar"]',
            '.loading',
            '[aria-label*="loading"]',
            '[aria-label*="checking"]',
            
            // Status messages
            'div:contains("Checking")',
            'span:contains("checking")',
            'div:contains("mail")',
            
            // Gmail's specific loading elements
            '.Kj-JD',
            '.T-I-Js-Gs',
            '.Vy'
        ];
        
        let foundIndicator = false;
        
        for (const selector of indicators) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                console.log('Found loading/status indicator:', selector, elements);
                foundIndicator = true;
                break;
            }
        }
        
        // Also check for any text that indicates checking is happening
        const bodyText = document.body.textContent || '';
        if (bodyText.toLowerCase().includes('checking') || 
            bodyText.toLowerCase().includes('retrieving') ||
            bodyText.toLowerCase().includes('loading')) {
            console.log('Found checking/loading text in page');
            foundIndicator = true;
        }
        
        if (foundIndicator) {
            console.log('✓ POP3 check appears to be working!');
            showNotification('POP3 check is running...', 'info');
        } else {
            console.log('⚠ Could not verify that POP3 check started');
            showNotification('Check may not have started. Try again if needed.', 'warning');
        }
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