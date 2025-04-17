# Epic-5 - Story-1
# Implement Finnish Localization

**As a** user who prefers Finnish
**I want** the app interface to be available in Finnish
**so that** I can use the app comfortably in my native language.

## Status

Draft

## Context

- The application currently only supports English.
- Adding Finnish localization will make the app accessible and more user-friendly for Finnish-speaking users.
- This involves setting up an internationalization (i18n) framework and translating all user-facing text.
- We will use the `react-i18next` library based on current best practices for React PWAs.

## Estimation

Story Points: 4

## Tasks

1.  - [x] **Setup i18n Framework**
    1.  - [x] Install `react-i18next`, `i18next`, and `i18next-browser-languagedetector`.
    2.  - [x] Create configuration file (`src/config/i18n.ts`).
    3.  - [x] Initialize `i18next` with English ('en') and Finnish ('fi') support, setting 'en' as fallback.
    4.  - [x] Configure backend for loading translations (e.g., bundling or `i18next-http-backend`).
    5.  - [x] Wrap `App` component with `I18nextProvider` in `main.tsx`.
2.  - [ ] **Structure Translation Files**
    1.  - [x] Create locale directory structure (e.g., `public/locales/en`, `public/locales/fi`).
    2.  - [x] Create initial `translation.json` (or namespace files like `common.json`, `drills.json`) in the `en` directory.
3.  - [x] **Extract English Strings**
    1.  - [x] Identify all hardcoded UI strings in components (buttons, titles, labels, messages, etc.).
    2.  - [x] Add corresponding keys and English values to the `en` translation files.
4.  - [x] **Implement Translations in Code**
    1.  - [x] Use the `useTranslation` hook in components requiring translated text.
    2.  - [x] Replace hardcoded strings with `t('yourKey')` calls.
    3.  - [x] Implement pluralization using `i18next` conventions (e.g., `t('key', { count: value })`).
5.  - [x] **Translate to Finnish**
    1.  - [x] Copy the English translation file structure to the `fi` directory.
    2.  - [x] Translate all string values into Finnish.
6.  - [x] **Create Settings Page**
    1.  - [x] Create a new `SettingsPage.tsx` component in `src/pages/`.
    2.  - [x] Add a route for `/settings` in `src/App.tsx` pointing to `SettingsPage`.
    3.  - [x] Add a Settings icon button to the `AppBar` in `src/App.tsx` that links to `/settings`.
7.  - [x] **Implement Language Switcher UI**
    1.  - [x] Add UI elements (e.g., buttons, radio group, or dropdown) within `SettingsPage.tsx` for language selection (English/Finnish).
    2.  - [x] Implement logic using `i18n.changeLanguage('fi'/'en')` to switch languages when the user interacts with the UI.
    3.  - [x] Ensure the UI reflects the currently active language.
    4.  - [x] Consider persisting the selected language (e.g., in localStorage) - `i18next-browser-languagedetector` might handle this already.
8.  - [ ] **Handle Formatting**
    1.  - [ ] Review date and number formats; ensure they are locale-aware if necessary (using `Intl` or libraries).
9.  - [ ] **Testing**
    1.  - [ ] Test UI thoroughly in both English and Finnish.
    2.  - [ ] Verify all strings are translated.
    3.  - [ ] Check layout consistency across languages.
    4.  - [ ] Test language switching functionality.

## Constraints

- Ensure the chosen method for loading translation files (bundling vs. dynamic loading) works reliably with the PWA's offline caching strategy via the service worker. Dynamic loading might require specific cache configurations.
- Maintain clear and consistent keys across translation files.

## Mobile UI Best Practices

For our mobile application with multi-language support, we follow these best practices:

1. **Bottom Navigation**
   - Implemented at the bottom of the screen for easy thumb access
   - Includes iOS safe area support via `env(safe-area-inset-bottom)` padding
   - Uses Material UI's `BottomNavigation` component for consistent UX
   - Icons and labels that clearly communicate functionality without language ambiguity

2. **Language-Specific Considerations**
   - Account for text expansion/contraction between languages (Finnish words can be longer)
   - Ensure all UI containers can accommodate text of varying lengths
   - Use flexible layouts that adapt to different text sizes
   - Test UI in all supported languages to identify potential overflow issues

3. **Viewport Configuration**
   - Added `viewport-fit=cover` to the viewport meta tag to ensure proper rendering on notched devices
   - Implemented proper padding and safe areas to avoid content being hidden by device UI elements

4. **Device Adaptation**
   - Consistent experience across iOS and Android 
   - Support for both portrait and landscape orientations
   - Responsive design that adapts to different screen sizes and device capabilities

5. **Accessibility**
   - All interactive elements sized appropriately (minimum 44×44 pixels)
   - Adequate color contrast that works across language contexts
   - Clear visual feedback for interactive elements

## Data Models / Schema

- **Translation File Structure (Example):**
  ```json
  // public/locales/en/common.json
  {
    "appName": "Disc Golf Training",
    "save": "Save",
    "cancel": "Cancel"
  }

  // public/locales/fi/common.json
  {
    "appName": "Disc Golf Treeni",
    "save": "Tallenna",
    "cancel": "Peruuta"
  }
  ```

## Structure

- **Configuration:** `src/config/i18n.ts`
- **Locales:** `public/locales/{lang}/{namespace}.json` (if using http-backend) OR `src/locales/{lang}/{namespace}.json` (if bundling)

## Diagrams

```mermaid
graph TD
    A[User interacts with Language Switcher] --> B{Selects 'Finnish'};
    B --> C[Call i18n.changeLanguage('fi')];
    C --> D[i18next loads 'fi' translations];
    D --> E[React components re-render with Finnish text];

    A --> F{Selects 'English'};
    F --> G[Call i18n.changeLanguage('en')];
    G --> H[i18next loads 'en' translations];
    H --> E;
```

## Dev Notes

- Use `react-i18next` library.
- Follow best practices from search results, especially regarding PWA performance (lazy loading).
- Pay attention to pluralization rules.
- Refactor any hardcoded strings in services (like `drillService`) if they need translation.

## Chat Command Log

- {Commands and responses related to this story will be added here} 