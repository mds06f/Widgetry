# Widgetry 🚀

An open-source, custom embeddable widget platform. It allows developers and creators to design custom widgets (such as digital clocks, dynamic weather cards, and quote displays) and embed them seamlessly on Notion pages, blogs, or portfolio websites via a simple `<iframe>` tag.

This repository is structured as a beginner-friendly monorepos-like structure, facilitating smooth open-source contributions. It is built using **React (Vite)**, **Node.js (Express)**, and a **local JSON database** for zero-config persistence.

---

## 🛠 Tech Stack & Architecture

Widgetry uses a simple and modular client-server architecture:

- **Frontend Client (`/client`)**:
  - **Framework**: React.js bootstrapped with Vite for fast HMR.
  - **Styling**: Modern, fluid vanilla CSS with global design tokens (`index.css`) supporting a glassmorphic dark theme.
  - **Icons**: Lucide React for modern, crisp UI icons.
  - **Dynamic Router**: Custom, lightweight React-state routing (`App.jsx`) to handle path changes dynamically.

- **Backend API Server (`/server`)**:
  - **Server**: Express.js handling REST API routes.
  - **Proxy Services**: Serves a secure, mapped API proxy to fetch weather data from open APIs (Open-Meteo) without exposing client requests.
  - **Database**: Zero-dependency filesystem-based JSON database (`server/widgets.json`), managed via a helper module (`database.js`). No external databases (MongoDB, PostgreSQL) or Docker containers are required.

- **Centralized Widget Registry (`client/src/widgets`)**:
  - Code-based registration system. Adding a widget registers its configuration panel and rendering logic in a single export (`index.js`).

---

## 📂 Repository Layout

```text
widgetry/
├── client/
│   ├── src/
│   │   ├── pages/         # High-level layouts: Dashboard, Editor, and Widget Renderer
│   │   │   ├── Dashboard.jsx      # Lists existing widgets and manages creation
│   │   │   ├── WidgetEditor.jsx   # Real-time visual editor & live CSS stylesheet preview
│   │   │   └── WidgetRender.jsx   # Clean widget render viewport for embed iframes
│   │   ├── widgets/       # The modular widget registry (Core directory for custom widgets)
│   │   │   ├── Clock/     # Digital Clock widget View & Config components
│   │   │   ├── Quote/     # Quote widget View & Config components
│   │   │   ├── Weather/   # Weather widget View & Config components (Proxy-bound)
│   │   │   └── index.js   # Central registry binding Views, Configs, and default values
│   │   ├── App.jsx        # Routing and base layout container
│   │   └── index.css      # Core Design System (CSS variables, variables layout)
│   └── vite.config.js     # Dev server proxying `/api` requests to port 5001
└── server/
    ├── database.js        # Helper to read/write configurations to local widgets.json
    ├── routes/
    │   └── widgets.js     # Endpoints for CRUD operations & Weather API Proxy
    ├── widgets.json       # Git-ignored local DB file (initialized dynamically)
    └── server.js          # Express server entry point
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites

Before setting up the project, make sure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### 2. Set Up the Repository

Clone the project to your local machine:

```bash
# Clone the repository
git clone <your-fork-url>

# Navigate into the project directory
cd widgetry

# Install root, client, and server dependencies concurrently
npm run install:all
```

### 3. Run Development Servers

Run the frontend client and the backend server concurrently in development mode:

```bash
npm run dev
```

The CLI will run the servers on:

- 💻 **Frontend client**: `http://localhost:5173`
- ⚙️ **Backend API server**: `http://localhost:5001`
- 📡 **Vite proxy config**: Automatically proxies `/api/*` from the frontend to the backend server.

---

## 🧩 How to Embed Widgets

Once you create a widget using the dashboard visual customizer and click **Save Widget**:

1. Copy the generated `<iframe>` code snippet from the visual customizer panel.
2. The embed code points to:
   ```html
   <iframe
     src="http://localhost:5173/widget/render/<widget-id>"
     width="100%"
     height="200"
     style="border:none;border-radius:12px;"
     scrolling="no"
   ></iframe>
   ```
3. When embedded, the custom router detects `/widget/render/` paths and yields a layout-free sandbox viewport displaying only the raw widget view (without navbar, borders, or buttons).

---

## 🤝 Contributing Guidelines

We love contributions! Widgetry is designed specifically to be beginner-friendly for learning Full-stack development, React configuration forms, API proxies, and local databases.

To get started:

1. Review our [Good First Issues & Feature Roadmap](./ISSUES.md) to pick an open task.
2. Follow our detailed, step-by-step onboarding guide in [CONTRIBUTING.md](./CONTRIBUTING.md) to understand how to write and register your own custom widget component.
3. **Workflow Rules**:
   - Always branch off from the `development` branch (e.g. `git checkout -b feature/my-feature development`).
   - Create clean, focused commits.
   - Open your Pull Request (PR) targeting the `development` branch.
