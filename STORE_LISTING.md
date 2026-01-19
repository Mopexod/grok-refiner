# Chrome Web Store Listing - Reference Guide

This document contains all the texts and information needed to fill out the Chrome Web Store Developer Dashboard when publishing Refiner for Grok.

---

## Store Listing Tab

### Basic Information

**Extension Name:**
```
Refiner for Grok
```

**Short Description** (up to 132 characters):
```
Professional control surface for iterative AI editing on Grok and X.com. Pin fragments, add precise instructions, manage revisions.
```
*(Current length: 125 characters)*

**Detailed Description:**

```
Refiner for Grok is a professional control surface for working with Grok AI responses. It solves the problem of iterative AI editing by letting you pin specific text fragments, add precise instructions, and send structured prompts back to the chat — without losing context or rewriting everything manually.

DISCLAIMER

An unofficial Chrome extension for a more convenient experience with Grok from xAI. Not affiliated with xAI or Elon Musk.

KEY FEATURES

• Select & Pin Fragments
  Click and select any portion of Grok's response to capture it. A floating "Add Edit" button appears instantly.

• Add Editing Instructions
  Write specific comments for each fragment: "make this shorter", "add examples", "explain in simpler terms", etc.

• Structured Prompts
  Use the "To Chat" button to insert a well-formatted prompt directly into Grok's input field. Each fragment is quoted with your instructions below it.

• Persistent Storage
  Your edits are saved locally. Close the browser, come back tomorrow — everything is still there.

• Clean UI
  Collapsible side panel with dark theme. Doesn't interfere with Grok's interface. Works on grok.com, x.ai, and x.com/i/grok.

PERFECT FOR

• Iterative refinement of AI-generated content
• Content creators working with multiple AI drafts
• Developers reviewing code snippets from Grok
• Researchers managing long AI conversations
• Anyone who needs precise control over AI editing workflows

HOW IT WORKS

1. Open Grok, start a conversation
2. When you see text you want to refine, select it
3. Click "Add Edit" on the floating button
4. Add your instruction in the side panel
5. Click "To Chat" to send the formatted prompt back to Grok
6. Grok responds with your requested changes

NO DATA COLLECTION

Refiner for Grok stores everything locally on your device. No analytics, no tracking, no external servers. Your conversations stay private.

OPEN SOURCE

Full source code available at: https://github.com/Mopexod/grok-refiner
MIT License. Community contributions welcome.
```

**Category:**
```
Productivity
```

**Language:**
```
English (en)
```

---

## Privacy Tab

### Single Purpose

**Single Purpose Description:**

```
Refiner for Grok provides a control surface for iterative AI editing on Grok and X.com. It allows users to select text fragments from AI responses, add editing instructions, and send structured prompts back to the chat interface. All functionality is focused on improving the workflow of refining AI-generated content through precise, fragment-based editing.

Disclaimer: An unofficial Chrome extension for a more convenient experience with Grok from xAI. Not affiliated with xAI or Elon Musk.
```

### Privacy Policy URL

```
https://github.com/Mopexod/grok-refiner/blob/main/PRIVACY.md
```

### Data Usage Certification

**Does your extension collect or transmit user data?**
- Answer: **Yes** (we store data locally)

**What user data does your extension collect?**
- Text fragments selected by the user from Grok AI responses
- User-written comments and instructions for each fragment
- UI state preferences (panel collapsed/expanded, active edit)
- Last used platform preference (grok/x.ai)

**How is this data used?**
- To display the user's selected fragments and comments in the editing panel
- To format and insert structured prompts into the Grok chat interface
- To persist the user's work between browser sessions
- To remember UI preferences

**Where is this data stored?**
- Locally on the user's device using Chrome's `chrome.storage.local` API
- No data is transmitted to external servers
- No cloud synchronization (unless user manually enables Chrome sync)

**Is the data shared with third parties?**
- Answer: **No**

**Is the data used for advertising or analytics?**
- Answer: **No**

**Data Retention:**
- Data is retained until the user deletes individual items or uninstalls the extension
- User has full control over data deletion through the extension's UI or Chrome's extension settings

---

## Distribution Tab

### Visibility

**Publishing status:**
```
Public
```

**Countries:**
```
All countries
```

### Pricing

**Is this extension free?**
```
Yes, completely free
```

---

## Additional Assets Needed

### Screenshots Required
- **Minimum:** 1 screenshot
- **Recommended:** 5 screenshots
- **Size:** 1280x800 or 640x400 pixels
- **Format:** PNG or JPG
- **Current status:** ✅ Created and unified (01.png, 02.png, 03.png)

### Promotional Images

**Small Promotional Image (REQUIRED):**
- **Size:** 440x280 pixels
- **Format:** PNG or JPG
- **Status:** ✅ Created (04.png)

**Marquee Image (Optional, for featuring):**
- **Size:** 1400x560 pixels
- **Format:** PNG or JPG
- **Status:** ⚠️ Not yet created (optional)

### Icons
- ✅ All required sizes present (16x16, 32x32, 48x48, 128x128)

---

## Support & Contact

**Developer Website:**
```
https://github.com/Mopexod/grok-refiner
```

**Support Email:**
```
[Your email address for support inquiries]
```

**Support URL:**
```
https://github.com/Mopexod/grok-refiner/issues
```

---

## Review Submission Notes

When submitting for review, you can provide testing instructions if needed:

**Test Instructions:**

```
1. Install the extension
2. Navigate to grok.com or x.com/i/grok
3. Start a conversation with Grok AI
4. When Grok responds, select any portion of text
5. Click the "Add Edit" floating button that appears
6. The side panel opens showing your selected fragment
7. Add a comment (e.g., "make this shorter")
8. Click "To Chat" button
9. The formatted prompt is inserted into Grok's input field
10. Send the message to Grok

No special accounts or credentials needed. Works with any Grok account.
```

---

## Pre-Launch Checklist

Before submitting to Chrome Web Store:

- [x] manifest.json is valid and compliant with Manifest V3
- [x] Privacy Policy created and published on GitHub
- [x] Single Purpose description prepared
- [x] Store listing descriptions written
- [x] Screenshots verified/created (1280x800 or 640x400)
- [x] Small Promotional Image created (440x280)
- [ ] Extension tested on all supported domains (grok.com, x.ai, x.com)
- [ ] All permissions are justified and documented
- [ ] No console errors or warnings
- [ ] No TODO or debug code in production
- [ ] Version number is correct (0.1.0 for initial release)
- [ ] GitHub repository is public and accessible
- [ ] Support email is monitored

---

## Post-Publication

After the extension is published:

1. Update README.md with Chrome Web Store badge and link
2. Monitor GitHub Issues for bug reports
3. Respond to user reviews in the Chrome Web Store
4. Plan updates based on user feedback

---

**Document Version:** 1.0  
**Last Updated:** January 19, 2026
