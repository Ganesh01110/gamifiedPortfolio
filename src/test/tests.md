# Portfolio Test Suite Reference

This directory contains automated tests to ensure the long-term stability and reliability of your portfolio. We use **Vitest** with the **happy-dom** environment for fast, reliable testing.

---

## 🚀 How to Run Tests

Run the following command in your terminal:
```bash
npm run test
```
*Note: This starts Vitest in "Watch Mode" by default. Press `q` to quit or `a` to run all tests again.*

---

## 📁 Test Files Overview

### 1. `sendEmail.test.ts`
*   **What it does:** Verifies the Server Action responsible for sending contact form emails.
*   **What it solves:** 
    *   Ensures users can't send empty messages (Validation Check).
    *   Verifies "Simulation Mode" works when your Resend API key is missing (Local Dev Safety).
    *   Tests successful handoff to the Resend service.
*   **Problem Prevention:** Prevents you from deploying a broken contact form if you change the email logic.

### 2. `integrity.test.ts`
*   **What it does:** Audits your `projects.json` and `characters.json` data files.
*   **What it solves:** 
    *   Checks for duplicate IDs (which can break React loops).
    *   Verifies that all assets (GIFs/Images) are defined as strings and end in the correct extension.
*   **Problem Prevention:** Prevents the "blank project" bug that happens if you accidentally delete a line in your data files.

### 3. `themeStore.test.ts`
*   **What it does:** Tests the Zustand state manager for Light/Dark mode.
*   **What it solves:** 
    *   Ensures the site always starts in a predictable state (Dark mode).
    *   Verifies that the `setTheme` function correctly updates the global UI state.
*   **Problem Prevention:** Ensures your "Theme Switcher" never gets stuck during navigation.

---

## 🛠 Adding New Tests
When you build a new feature, create a new file ending in `.test.ts` in this folder. Vitest will automatically pick it up!
