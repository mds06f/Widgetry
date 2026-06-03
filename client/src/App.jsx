import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import WidgetEditor from './pages/WidgetEditor';
import WidgetRender from './pages/WidgetRender';
import { Layers } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    // Listen for custom navigate events
    window.addEventListener('navigate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('navigate', handleLocationChange);
    };
  }, []);

  // Simple navigate function
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('navigate'));
  };

  // Route matching helpers
  const isDashboard = currentPath === '/';
  const isCreate = currentPath.startsWith('/create/');
  const isEdit = currentPath.startsWith('/edit/');
  const isRender = currentPath.startsWith('/widget/render/');

  // Parse path parameters
  let pageComponent = null;

  if (isDashboard) {
    pageComponent = <Dashboard navigate={navigate} />;
  } else if (isCreate) {
    const type = currentPath.split('/')[2];
    pageComponent = <WidgetEditor navigate={navigate} initialType={type} isNew={true} />;
  } else if (isEdit) {
    const id = currentPath.split('/')[2];
    pageComponent = <WidgetEditor navigate={navigate} initialId={id} isNew={false} />;
  } else if (isRender) {
    const id = currentPath.split('/')[3];
    pageComponent = <WidgetRender id={id} />;
  } else {
    // 404 Fallback
    pageComponent = (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>404 - Page Not Found</h2>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  // If rendering inside an iframe, don't show the navigation bar or outer margins
  if (isRender) {
    return <div className="widget-render-body">{pageComponent}</div>;
  }

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Layers size={28} style={{ color: '#6366f1' }} />
          <span>Widgetry</span>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          Dashboard
        </button>
      </header>
      
      <main className="main-content">
        {pageComponent}
      </main>
    </div>
  );
}
