// Gmail POP3 Debug Helper
// Run this in the browser console on the Gmail accounts settings page to debug

function debugPOP3Setup() {
    console.log('=== Gmail POP3 Debug Helper ===');
    console.log('Current URL:', window.location.href);
    
    // Check if we're on the right page
    if (!window.location.href.includes('settings/accounts')) {
        console.log('❌ Not on accounts settings page');
        console.log('Navigate to: https://mail.google.com/mail/u/0/#settings/accounts');
        return;
    }
    
    console.log('✓ On accounts settings page');
    
    // Look for POP3 accounts section
    const pageText = document.body.textContent || '';
    if (pageText.includes('Check mail from other accounts')) {
        console.log('✓ Found "Check mail from other accounts" section');
    } else {
        console.log('❌ Could not find "Check mail from other accounts" section');
        console.log('Make sure you have POP3 accounts configured');
    }
    
    // Find all buttons and inputs
    console.log('\n=== All Buttons on Page ===');
    const allButtons = document.querySelectorAll('input[type="button"], input[type="submit"], button');
    allButtons.forEach((btn, index) => {
        const text = btn.textContent || btn.value || btn.title || '';
        const isVisible = btn.offsetParent !== null;
        const isDisabled = btn.disabled;
        
        console.log(`${index + 1}. ${btn.tagName}`, {
            text: text,
            value: btn.value,
            visible: isVisible,
            disabled: isDisabled,
            element: btn
        });
        
        if (text.toLowerCase().includes('check') || text.toLowerCase().includes('mail')) {
            console.log('  ^ This might be the check button!');
        }
    });
    
    // Look for specific Gmail patterns including span elements
    console.log('\n=== Specific Button/Span Searches ===');
    const selectors = [
        // Span-based (new Gmail style)
        'span[role="link"]',
        'span.rP.sA',
        'span[tabindex="0"]',
        'span:contains("Check mail now")',
        
        // Traditional buttons
        'input[value*="Check mail now"]',
        'input[value*="check mail"]',
        'input[value*="Check mail"]',
        'button[title*="Check mail"]',
        'input[type="button"][value*="Check"]'
    ];
    
    selectors.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            console.log(`${selector}: ${elements.length} elements`, elements);
            
            // For spans, also check their text content
            if (selector.includes('span') && elements.length > 0) {
                elements.forEach((el, i) => {
                    console.log(`  Span ${i + 1} text: "${el.textContent}"`);
                });
            }
        } catch (e) {
            console.log(`${selector}: Error - ${e.message}`);
        }
    });
    
    // Specifically look for "Check mail now" text
    console.log('\n=== Text-based Search for "Check mail now" ===');
    const allElements = document.querySelectorAll('*');
    const checkMailElements = [];
    
    allElements.forEach(el => {
        if (el.textContent && el.textContent.trim().toLowerCase() === 'check mail now') {
            checkMailElements.push(el);
        }
    });
    
    console.log(`Found ${checkMailElements.length} elements with "Check mail now" text:`, checkMailElements);
    
    // Look for forms that might contain POP3 check
    console.log('\n=== Forms Analysis ===');
    const forms = document.querySelectorAll('form');
    forms.forEach((form, index) => {
        const formText = form.textContent || '';
        if (formText.includes('Check mail') || formText.includes('POP3') || formText.includes('other accounts')) {
            console.log(`Form ${index + 1}:`, form);
            console.log('  Contains relevant text:', formText.substring(0, 200));
            
            const buttons = form.querySelectorAll('input[type="button"], input[type="submit"], button');
            console.log('  Buttons in form:', buttons);
        }
    });
    
    // Look for sections/rows that might contain POP3 settings
    console.log('\n=== POP3 Sections ===');
    const sections = document.querySelectorAll('tr, .Ze, .aAv, .aAt, div, section');
    let pop3Sections = [];
    
    sections.forEach(section => {
        const sectionText = section.textContent || '';
        if (sectionText.includes('Check mail from other accounts') || 
            sectionText.includes('POP3') ||
            (sectionText.includes('other accounts') && sectionText.includes('check'))) {
            pop3Sections.push(section);
        }
    });
    
    console.log(`Found ${pop3Sections.length} potential POP3 sections:`, pop3Sections);
    
    pop3Sections.forEach((section, index) => {
        console.log(`POP3 Section ${index + 1}:`, section);
        const buttonsInSection = section.querySelectorAll('input[type="button"], input[type="submit"], button');
        console.log('  Buttons in section:', buttonsInSection);
    });
    
    // Final recommendation
    console.log('\n=== Recommendation ===');
    if (pop3Sections.length > 0 && allButtons.length > 0) {
        console.log('✓ Found POP3 sections and buttons. The extension should work.');
        console.log('If it\'s not working, try clicking buttons manually to see which one works.');
    } else if (pop3Sections.length === 0) {
        console.log('❌ No POP3 sections found. Make sure you have POP3 accounts configured in Gmail.');
        console.log('Go to Settings > Accounts and Import > Add a mail account');
    } else {
        console.log('⚠ Found POP3 sections but no obvious check buttons.');
        console.log('The buttons might be loaded dynamically or have different selectors.');
    }
    
    console.log('\n=== Test Manual Click ===');
    console.log('Try running: document.querySelector(\'input[value*="Check"]\')?.click()');
}

// Auto-run if on accounts page
if (window.location.href.includes('settings/accounts')) {
    debugPOP3Setup();
} else {
    console.log('Gmail POP3 Debug Helper loaded. Run debugPOP3Setup() on the accounts settings page.');
}