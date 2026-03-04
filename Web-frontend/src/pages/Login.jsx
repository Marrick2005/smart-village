import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Smartphone, Lock, ArrowRight, UserCircle2 } from 'lucide-react';
import './Login.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function Login() {
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!contact || !password) {
      setError('请输入手机号和密码');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        contact,
        password
      });

      const { access_token, user_info } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user_info));

      // Navigate based on role
      if (user_info.identity_type === '管理员') {
        navigate('/admin');
      } else if (user_info.identity_type === '志愿者') {
        navigate('/volunteer');
      } else {
        navigate('/home');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('登录请求失败，请检查网络连接');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="login-content animate-fade-in">
        <div className="login-card glass-panel">
          <div className="login-header">
            <div className="logo-container">
              <UserCircle2 size={40} className="logo-icon" color="var(--primary)" />
            </div>
            <h1 className="gradient-text">涉县乡村数字大脑</h1>
            <p>欢迎回来，请登录您的账户</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && <div className="error-message animate-fade-in">{error}</div>}

            <div className="input-group delay-100">
              <label>手机号码</label>
              <div className="input-field">
                <Smartphone size={20} className="input-icon" />
                <input
                  type="tel"
                  placeholder="请输入手机号"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="input-group delay-200">
              <label>登录密码</label>
              <div className="input-field">
                <Lock size={20} className="input-icon" />
                <input
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-actions delay-300" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <button 
                type="button" 
                onClick={() => { localStorage.setItem('user', JSON.stringify({identity_type: '游客'})); navigate('/guest'); }} 
                className="forgot-password" 
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer', padding: 0 }}
              >
                游客免密访问 →
              </button>
              <Link to="/forgot-password" className="forgot-password">忘记密码？</Link>
            </div>

            <button
              type="submit"
              className={`submit-button delay-300 ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? '登录中...' : '立即登录'}
              {!loading && <ArrowRight size={20} className="btn-icon" />}
            </button>
          </form>

          <div className="login-footer delay-300">
            <p>还没有账号？ <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary)', marginLeft: '4px' }}>立即注册</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
