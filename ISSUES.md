# Good First Issues & Feature Roadmap 🚀

Welcome! If you are looking to contribute to **Widgetry**, here is a curated list of issues, feature requests, and new widget ideas you can work on. 

We have categorized them by difficulty to help you find the perfect task to start with.

---

## 🟢 Easy (Good First Issues)

### 1. Custom Background Image URL
* **Description**: Currently, widgets only support solid colors and preset gradients. We want to allow users to input a custom background image URL.
* **Component**: `client/src/widgets/` (all widgets view/config components)
* **Goal**: Add a `backgroundImageUrl` input field to the config forms and apply it as the `background-image` style in the views.

### 2. Digital Clock: 12-Hour vs. 24-Hour Format Toggle
* **Description**: The Digital Clock widget defaultConfig supports `timeFormat: '12'` or `'24'`, but the Config form needs a clean checkbox or toggle to let users change this in real-time.
* **Component**: `client/src/widgets/Clock/ClockWidgetConfig.jsx`
* **Goal**: Add a select dropdown or radio group to toggle between 12h and 24h formats.

### 3. Add More Gradient Presets
* **Description**: Expand the available background gradients.
* **Component**: `client/src/widgets/index.js` (the `GRADIENTS` object)
* **Goal**: Add 5-10 modern, vibrant gradient combinations to the central registry.

---

## 🟡 Medium (Intermediate Tasks)

### 4. Countdown Timer Widget
* **Description**: Create a new widget that counts down to a specific target date and time (e.g., "New Year 2027" or a personal deadline).
* **Component**: New folder `client/src/widgets/Countdown/`
* **Goal**: 
  - Add a View component calculating time remaining in real-time (Days, Hours, Minutes, Seconds).
  - Add a Config component with a datetime-local input picker and text fields for custom labels.
  - Register it in `index.js`.

### 5. Simple To-Do List Widget
* **Description**: A widget displaying a checklist. The list items should persist so that they are saved when embedded.
* **Component**: New folder `client/src/widgets/Todo/`
* **Goal**: 
  - Render an interactive checklist where items can be checked off or added.
  - Use `localStorage` in the View component to persist the list state per iframe instance.

### 6. Widget Thumbnail Previews on Dashboard
* **Description**: The main dashboard list displays a generic placeholder icon for all widgets. We want a visual preview card representing the actual widget.
* **Component**: `client/src/pages/Dashboard.jsx`
* **Goal**: Implement a mini-preview or use the registered Lucide icons dynamically to make the dashboard visually appealing.

---

## 🔴 Hard (Advanced Features)

### 7. Custom CSS Injector
* **Description**: Advanced users want to style their widgets with custom CSS overrides.
* **Component**: `client/src/widgets/` and `client/src/pages/WidgetEditor.jsx`
* **Goal**: 
  - Add a textarea config option for `customCSS` across all widgets.
  - In the Views, inject a `<style>` block containing the user-provided CSS dynamically.
  - Ensure safe escaping of input to prevent injection issues.

### 8. Spotify Now Playing Widget (Mocked or API Integrated)
* **Description**: A widget showing a sleek "Now Playing" music card.
* **Component**: New folder `client/src/widgets/Spotify/`
* **Goal**: Create a beautiful animated media player widget. You can start by mocking the Spotify web API or creating an authentication bridge on the server.

---

## How to Get Started 🛠️

1. **Pick an Issue**: Comment on the GitHub issue tracker (or choose one from this file) that you want to work on.
2. **Create a Branch**: Create a feature branch off of `development`:
   ```bash
   git checkout -b feature/your-feature-name development
   ```
3. **Write the Code**: Follow our [CONTRIBUTING.md](./CONTRIBUTING.md) guide.
4. **Push and PR**: Push your branch and open a PR targeting the `development` branch!
