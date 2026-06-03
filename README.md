# Widgetry 🚀

Widgetry is an open-source, custom embeddable widget platform. It allows developers and creators to design custom widgets (such as digital clocks, dynamic weather cards, and quote displays) and embed them seamlessly on Notion pages, blogs, or portfolio websites via a simple `<iframe>` tag.

This project is built using React, Node.js, Express, and local JSON storage. It is designed to be highly modular and beginner-friendly for open-source contributors and mentees.

---

## Key Features
- 📊 **Dynamic Creator Dashboard**: Manage all your widgets from a single UI.
- 🎨 **Real-Time Visual Customizer**: Customize themes, fonts, colors, and layout configurations with instant live updates.
- ⚡ **Zero-Config Installation**: Uses a local JSON database so you don't need MongoDB, PostgreSQL, or Docker to start hacking.
- 🔗 **Universal Embeds**: Standard HTML `<iframe>` embed codes that work on Notion, Medium, Ghost, and static sites.
- 🧩 **Modular Widget Registry**: Add new widgets simply by creating a View and a Config Form component.

---

## Quick Start

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 2. Clone and Install Dependencies
```bash
# Clone the repository
git clone <your-fork-url>
cd max

# Install all dependencies (Root, Server, and Client)
npm run install:all
```

### 3. Start Development Servers
Run the client and backend concurrently:
```bash
npm run dev
```

- **Frontend client** runs on: `http://localhost:5173`
- **Backend API server** runs on: `http://localhost:5001`

---

## How to Contribute
We love contributions! If you're looking to add a new widget or fix a bug, please check out our [CONTRIBUTING.md](./CONTRIBUTING.md) file for a detailed step-by-step onboarding guide.
