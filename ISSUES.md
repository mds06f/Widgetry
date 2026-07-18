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
* **Goal**: Add a toggle switch to switch between 12h and 24h formats.

---

## 🟡 Medium (Intermediate Tasks)

### 3. Countdown Timer Widget
* **Description**: Create a new widget that counts down to a specific target date and time (e.g., "New Year" or a personal deadline).
* **Component**: New folder `client/src/widgets/Countdown/`
* **Goal**: 
  - Add a View component calculating time remaining in real-time (Days, Hours, Minutes, Seconds).
  - Add a Config component with a datetime-local input picker and text fields for custom labels.
  - Register it in `index.js`.

### 4. Simple To-Do List Widget
* **Description**: A widget displaying a checklist. The list items should persist so that they are saved when embedded.
* **Component**: New folder `client/src/widgets/Todo/`
* **Goal**: 
  - Render an interactive checklist where items can be checked off or added.
  - Use `localStorage` in the View component to persist the list state per iframe instance.

### 5. Widget Thumbnail Previews on Dashboard
* **Description**: The main dashboard list displays a generic placeholder icon for all widgets. We want a visual preview card representing the actual widget.
* **Component**: `client/src/pages/Dashboard.jsx`
* **Goal**: Implement a live mini-preview via iframe to make the dashboard visually appealing.

### 6. GitHub Profile Stats Widget
* **Description**: A widget that displays a GitHub user's public repositories, followers, and contributions.
* **Component**: New folder `client/src/widgets/GithubStats/`
* **Goal**: 
  - Fetch data from the public GitHub API.
  - Display the profile picture, username, and key stats in a sleek card format.

### 7. Cryptocurrency Price Ticker Widget
* **Description**: A real-time crypto price ticker.
* **Component**: New folder `client/src/widgets/CryptoTicker/`
* **Goal**:
  - Integrate with a free API like CoinGecko.
  - Allow the user to select which coin to track (e.g., Bitcoin, Ethereum, Solana).
  - Show the current price and 24h percentage change.

### 8. Analog Clock Widget
* **Description**: A classic analog clock face widget.
* **Component**: New folder `client/src/widgets/AnalogClock/`
* **Goal**:
  - Build a sleek analog clock using SVG or CSS transforms for the hour, minute, and second hands.
  - Allow configuration of face color, hand colors, and tick marks.

### 9. Random Joke / Trivia Widget
* **Description**: A fun widget that displays a random joke or trivia fact and updates periodically.
* **Component**: New folder `client/src/widgets/Trivia/`
* **Goal**:
  - Connect to a public joke/trivia API.
  - Add a refresh button on the widget to get a new fact instantly.
  - Allow configuring the category (programming, dad jokes, general facts).

### 10. Pomodoro Timer Widget
* **Description**: A productivity timer widget based on the Pomodoro technique.
* **Component**: New folder `client/src/widgets/Pomodoro/`
* **Goal**:
  - Create a 25-minute work / 5-minute break toggle timer.
  - Include play/pause and reset controls.
  - Ring a subtle bell sound (optional) when the timer completes.

---

## 🔴 Hard (Advanced Features)

### 11. Custom CSS Injector
* **Description**: Advanced users want to style their widgets with custom CSS overrides.
* **Component**: `client/src/widgets/` and `client/src/pages/WidgetEditor.jsx`
* **Goal**: 
  - Add a textarea config option for `customCSS` across all widgets.
  - In the Views, inject a `<style>` block containing the user-provided CSS dynamically.
  - Ensure safe escaping of input to prevent injection issues.

### 12. Spotify Now Playing Widget (Mocked or API Integrated)
* **Description**: A widget showing a sleek "Now Playing" music card.
* **Component**: New folder `client/src/widgets/Spotify/`
* **Goal**: Create a beautiful animated media player widget. You can start by mocking the Spotify web API or creating an authentication bridge on the server.

### 13. User Authentication & Accounts
* **Description**: Currently, widgets are stored anonymously. We need a way for users to create accounts and manage their own widgets.
* **Component**: `server/`, `client/src/pages/`
* **Goal**:
  - Implement a basic authentication system (JWT or sessions).
  - Add Login / Sign Up pages.
  - Associate created widgets with user IDs in the database.

### 14. Real-time Collaborative Widget Editing
* **Description**: Allow multiple users to edit the same widget configuration simultaneously.
* **Component**: `server/`, `client/src/pages/WidgetEditor.jsx`
* **Goal**:
  - Integrate WebSockets (e.g., Socket.io).
  - Broadcast configuration changes in real-time so all viewers see the widget update instantly.

### 15. Custom Data Webhooks
* **Description**: Let users update widget data (like a custom counter or status text) by sending a POST request from their own servers.
* **Component**: `server/routes/widgets.js`, New webhook endpoints
* **Goal**:
  - Provide a unique webhook URL for applicable widgets.
  - Allow users to push JSON payloads to update the widget state dynamically without opening the editor.

### 16. Export Widget as Static HTML/JS Bundle
* **Description**: Allow users to download their configured widget as a standalone `.zip` file for hosting on their own servers.
* **Component**: `server/`, `client/src/pages/WidgetEditor.jsx`
* **Goal**:
  - Add an "Export Code" button.
  - Generate a single HTML file combining the widget's React component (compiled or vanilla JS equivalent) and inline CSS.

### 17. Multi-Widget Dashboard Grid
* **Description**: A new "Grid" widget type that embeds multiple other widgets into a unified layout.
* **Component**: New folder `client/src/widgets/Grid/`
* **Goal**:
  - Create a layout builder where users can select their existing widgets and arrange them in rows and columns.
  - Render the grid in a single responsive iframe.

### 18. Advanced Analytics Tracking
* **Description**: Track how many times an embedded widget is viewed across the web.
* **Component**: `server/`
* **Goal**:
  - Add an API endpoint to track widget loads.
  - Log the referring domain (where the widget is embedded).
  - Display a "Views" counter on the user's Dashboard.

---

## How to Get Started 🛠️

1. **Pick an Issue**: Comment on the GitHub issue tracker (or choose one from this file) that you want to work on.
2. **Create a Branch**: Create a feature branch off of `development`:
   ```bash
   git checkout -b feature/your-feature-name development
   ```
3. **Write the Code**: Follow our [CONTRIBUTING.md](./CONTRIBUTING.md) guide.
4. **Push and PR**: Push your branch and open a PR targeting the `development` branch!
