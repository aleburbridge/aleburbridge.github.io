import { useState } from 'react';
import { useApp } from '../AppContext';

export function LoginPage() {
  const app = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = email.trim() !== '' && password.trim() !== '' && !app.isLoadingAuth;

  return (
    <div className="login-wrap">
      <div className="login-inner">
        <h1 className="login-title">
          CALISTHENICS <span>SLOP</span>
        </h1>

        <img src={`${import.meta.env.BASE_URL}login_illustration.png`} alt="" className="login-illustration" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label">EMAIL</label>
            <input
              className="field-input"
              type="email"
              autoComplete="email"
              placeholder="user@example.com"
              value={email}
              onChange={e => { app.clearAuthError(); setEmail(e.target.value); }}
            />
          </div>

          <div>
            <label className="field-label">PASSWORD</label>
            <input
              className="field-input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => { app.clearAuthError(); setPassword(e.target.value); }}
            />
          </div>

          {app.signUpSuccess && (
            <div className="login-success">
              <span>✓</span>
              <span>NEW USER SLOPPED SUCCESSFULLY.<br />VERIFY YOUR EMAIL AND SIGN IN.</span>
            </div>
          )}

          {app.authError && (
            <div className="login-error">{app.authError.toUpperCase()}</div>
          )}

          <button
            className="btn btn-primary"
            style={{ marginTop: 8 }}
            disabled={!canSubmit}
            onClick={() => app.signIn(email, password)}
          >
            {app.isLoadingAuth ? '...' : 'GET BACK IN THE TROUGH'}
          </button>

          <button
            className="btn btn-danger"
            disabled={!canSubmit}
            onClick={() => app.signUp(email, password)}
          >
            JOIN THE SLOP
          </button>
        </div>
      </div>
    </div>
  );
}
