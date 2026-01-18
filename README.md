# Grok Refiner

Grok Refiner is a Chrome extension that adds a control layer on top of Grok's interfaces. It is designed for users who work with AI on texts, code, and data on grok.com and Grok integrated into x.com.

## Problem
When working with Grok, you often need to refine specific fragments of a response rather than the entire output. Attempting to do this directly in chat leads to the AI changing things you didn't want changed, losing discussion context, and forcing manual copy-pasting that clutters the clipboard.

## Solution
Grok Refiner provides a separate workspace right in your browser. It allows you to isolate selected text fragments, prepare precise instructions for each fragment, and avoid interfering with the main AI conversation flow.

## Workflow
1. **Select Text**: User selects any text on the Grok page, and a contextual "Add Edit" button appears next to the selection.
2. **Collect Fragments**: Clicking the button sends the fragment to the side panel.
3. **Edit**: A list of selected fragments forms in the side panel. For each, you can add a comment specifying exactly what needs to be changed, clarified, or reworked.
4. **Insert to Chat**: The "To Chat" button inserts the "Quote + Comment" pair into Grok's input field.
5. **Control**: The user manually sends the message — the extension does not submit requests automatically.

## Technical Features
- **Compatibility**: Works on grok.com and Grok within x.com.
- **Isolation**: Uses an isolated iframe for stable operation without conflicts with the site interface.
- **Data Persistence**: Selected fragments and comments are stored in the browser's local storage, ensuring data safety when closing tabs or switching between sites.

## Installation for Developers

1. Clone the repository:
   ```bash
   git clone https://github.com/Mopexod/grok-refiner.git
   cd grok-refiner
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked extension"
   - Select the `grok-refiner` project folder

## Conclusion
Grok Refiner is a professional tool for precise, controlled work with AI responses. It eliminates manual copy-pasting, reduces errors, and allows you to manage the quality of every individual response fragment.

## License
MIT
