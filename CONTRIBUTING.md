# Contributing to Widgetry

Welcome! We are thrilled that you want to contribute to Widgetry. This project is specifically designed to be beginner-friendly. 

This guide will walk you through the codebase architecture and explain how to add your first custom widget.

---

## Branching & PR Workflow

To keep the project organized, we follow a simple branching workflow:
1. **Target Branch**: The `development` branch is the main, active development branch.
2. **Feature Branches**: For any new features, bug fixes, or improvements, create a new branch from `development` (e.g., `git checkout -b feature/my-new-widget development`).
3. **Submitting Changes**: Once your work is complete, push your branch and open a Pull Request (PR) targeting the `development` branch.

---

## Codebase Architecture

```text
widgetry/
├── client/
│   ├── src/
│   │   ├── pages/         # Dashboard, WidgetEditor, and WidgetRender pages
│   │   └── widgets/       # The modular widget registry (Start here!)
│   │       ├── Clock/     # Example: Clock widget folder
│   │       ├── index.js   # Central registry connecting widgets to the editor
└── server/
    ├── database.js        # File-based JSON database (writes to widgets.json)
    └── routes/            # API endpoints
```

---

## How to Add a New Widget (Step-by-Step)

Adding a widget to Widgetry requires creating a folder inside `client/src/widgets/` containing two React components:
1. **View Component (`*View.jsx`)**: Renders the final widget UI inside the `<iframe>`.
2. **Config Component (`*Config.jsx`)**: Renders the settings form displayed in the Widget Editor.

### Step 1: Create your widget folder
Create a new folder in `client/src/widgets/` using PascalCase (e.g., `MyWidget`).

### Step 2: Create the View Component (`MyWidgetView.jsx`)
This component receives a `config` object as a prop and renders the HTML/CSS representing the widget.

```jsx
import React from 'react';

export default function MyWidgetView({ config }) {
  // Extract custom configuration options set by the user
  const { text = 'Hello World', textColor = '#ffffff', fontSize = '24px' } = config;

  return (
    <div style={{ 
      color: textColor, 
      fontSize: fontSize, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      height: '100vh',
      textAlign: 'center'
    }}>
      {text}
    </div>
  );
}
```

### Step 3: Create the Config Component (`MyWidgetConfig.jsx`)
This component renders the input forms in the editor. When fields are changed, it calls `onChange` with the updated configuration.

```jsx
import React from 'react';

export default function MyWidgetConfig({ config, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="config-group">
      <h3>Widget Settings</h3>
      
      <div className="config-field">
        <label>Display Text</label>
        <input 
          type="text" 
          value={config.text || ''} 
          onChange={(e) => handleChange('text', e.target.value)} 
        />
      </div>

      <div className="config-field">
        <label>Text Color</label>
        <input 
          type="color" 
          value={config.textColor || '#ffffff'} 
          onChange={(e) => handleChange('textColor', e.target.value)} 
        />
      </div>
    </div>
  );
}
```

### Step 4: Register your widget in `client/src/widgets/index.js`
Open `client/src/widgets/index.js` and register your new widget:

```javascript
import MyWidgetView from './MyWidget/MyWidgetView';
import MyWidgetConfig from './MyWidget/MyWidgetConfig';

export const widgetRegistry = {
  // Existing widgets...
  mywidget: {
    name: 'Custom Text Widget',
    description: 'Displays customized typography',
    icon: 'Type', // Name of Lucide icon
    view: MyWidgetView,
    config: MyWidgetConfig,
    defaultConfig: {
      text: 'Hello World',
      textColor: '#ffffff',
      fontSize: '24px'
    }
  }
};
```

That's it! The system will automatically:
- List your widget as an option in the dashboard creator modal.
- Render your configuration form in the editor.
- Update the live preview instantly as developers change settings.
- Render the widget correctly inside standard HTML iframes.
