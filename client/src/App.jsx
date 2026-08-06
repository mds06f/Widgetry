import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import WidgetEditor from './pages/WidgetEditor';
import WidgetRender from './pages/WidgetRender';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import { Layers, LogIn, LogOut, User } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [token, setToken] = useState(
    localStorage.getItem('widgetry_token') || null,
  );
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

  // Fetch current user details on mount/token change
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error('Unauthorized');
        })
        .then((data) => {
          setUser(data);
        })
        .catch(() => {
          localStorage.removeItem('widgetry_token');
          setToken(null);
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, [token]);

  // Simple navigate function
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('navigate'));
  };

  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('widgetry_token');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  // Route matching helpers
  const isDashboard = currentPath === '/';
  const isCreate = currentPath.startsWith('/create/');
  const isEdit = currentPath.startsWith('/edit/');
  const isRender = currentPath.startsWith('/widget/render/');

  // Parse path parameters
  let pageComponent = null;

  if (isDashboard) {
    pageComponent = <Dashboard navigate={navigate} token={token} user={user} />;
  } else if (isCreate) {
    const type = currentPath.split('/')[2];
    pageComponent = (
      <WidgetEditor
        navigate={navigate}
        initialType={type}
        isNew={true}
        token={token}
        user={user}
      />
    );
  } else if (isEdit) {
    const id = currentPath.split('/')[2];
    pageComponent = (
      <WidgetEditor
        navigate={navigate}
        initialId={id}
        isNew={false}
        token={token}
        user={user}
      />
    );
  } else if (isRender) {
    const id = currentPath.split('/')[3];
    pageComponent = <WidgetRender id={id} />;
  } else {
    // 404 Fallback
    pageComponent = (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>404 - Page Not Found</h2>
        <button
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
          onClick={() => navigate('/')}
        >
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
        <div
          className="logo"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <Layers size={28} style={{ color: '#6366f1' }} />
          <span>Widgetry</span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Dashboard
          </button>

          {user ? (
            <div
              style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
            >
              <div
                onClick={() => setIsProfileOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.85rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.09)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                title="Edit profile settings"
              >
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="Avatar"
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid #818cf8'
                    }}
                  />
                ) : (
                  <User size={14} style={{ color: '#818cf8' }} />
                )}
                <span style={{ color: 'var(--text-secondary)' }}>
                  {user.email}
                </span>
              </div>
              <button
                className="btn btn-secondary"
                onClick={handleLogout}
                style={{ gap: '0.4rem' }}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => setIsAuthOpen(true)}
              style={{ gap: '0.4rem' }}
            >
              <LogIn size={14} />
              <span>Login / Signup</span>
            </button>
          )}
        </div>
      </header>

      <main className="main-content">{pageComponent}</main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        token={token}
        onProfileUpdate={(updatedUser) => setUser(updatedUser)}
      />
    </div>
  );
}
