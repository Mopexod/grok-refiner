# Privacy Policy for Grok Refiner

**Last Updated:** January 19, 2026

## Overview

Grok Refiner is a browser extension designed to enhance your interaction with Grok AI by allowing you to select text fragments from AI responses, add editing instructions, and send structured prompts back to the chat interface.

This Privacy Policy explains how Grok Refiner handles user data.

## Data Collection and Usage

### What Data We Collect

Grok Refiner collects and stores the following data **locally on your device only**:

1. **Text Fragments**: Portions of text you select from Grok AI responses
2. **Your Comments**: Editing instructions or notes you add to selected fragments
3. **UI State**: Panel collapse/expand state and active edit selection
4. **Platform Preference**: Last used platform (Grok/X.ai)

### How We Use This Data

All data is used exclusively to provide the extension's core functionality:

- Display your selected fragments and comments in the editing panel
- Format and insert structured prompts into the Grok chat input
- Preserve your work between browser sessions
- Remember your UI preferences

### Data Storage

- **All data is stored locally** using Chrome's `chrome.storage.local` API
- **No data is transmitted** to any external servers, third parties, or our servers
- **No analytics or tracking** of any kind is implemented
- **No cloud synchronization** occurs unless you manually enable Chrome's sync feature (controlled by your browser settings, not by this extension)

## Permissions Explanation

Grok Refiner requests the following permissions:

### Required Permissions

- **`storage`**: To save your text fragments, comments, and preferences locally on your device
- **`clipboardWrite`**: To copy formatted prompts to your clipboard when using the copy functionality

### Host Permissions

The extension operates only on these domains:
- `grok.com` and its subdomains
- `x.ai` and its subdomains
- `x.com` and its subdomains

These permissions are necessary to:
- Inject the editing panel and floating button into the Grok interface
- Detect text selection within AI responses
- Insert formatted prompts into the chat input field

## Data Sharing

**We do not share, sell, or transmit any user data to third parties.** Period.

- No data leaves your device
- No analytics services
- No advertising networks
- No data brokers
- No external API calls

## Data Security

Your data is protected by:

- Chrome's built-in storage security mechanisms
- Local-only storage (no network transmission)
- No authentication or account system (no risk of account breaches)

## Your Data Rights

You have full control over your data:

- **Access**: View all stored data through the extension's editing panel
- **Modification**: Edit or update any saved fragments and comments
- **Deletion**: Delete individual items or clear all data by removing the extension
- **Export**: Use the "To Chat" feature to copy your data into Grok's chat interface

### How to Delete Your Data

To completely remove all data stored by Grok Refiner:

1. Uninstall the extension from Chrome
2. All locally stored data will be automatically deleted

Alternatively, to clear data while keeping the extension installed:

1. Open Chrome's Extensions page (`chrome://extensions/`)
2. Find "Grok Refiner"
3. Click "Details"
4. Scroll to "Site settings"
5. Click "Clear storage"

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Any changes will be reflected in the "Last Updated" date at the top of this document.

Significant changes will be communicated through:
- Extension update notes in the Chrome Web Store
- GitHub repository releases

## Contact Information

If you have questions or concerns about this Privacy Policy or data handling:

- **GitHub Issues**: [https://github.com/Mopexod/grok-refiner/issues](https://github.com/Mopexod/grok-refiner/issues)
- **Repository**: [https://github.com/Mopexod/grok-refiner](https://github.com/Mopexod/grok-refiner)

## Compliance

This extension complies with:

- Chrome Web Store Developer Program Policies
- Chrome Web Store User Data Policy
- General Data Protection Regulation (GDPR) principles
- California Consumer Privacy Act (CCPA) principles

## Summary

**In plain language:**

Grok Refiner is a simple productivity tool that:
- Stores your text selections and notes **only on your computer**
- Does **not** send any data anywhere
- Does **not** track you
- Does **not** show ads
- Does **not** collect personal information

Your data is yours. We can't access it, we don't want it, and we don't collect it.
