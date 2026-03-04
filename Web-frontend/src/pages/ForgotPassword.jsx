import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Smartphone, Lock, ShieldCheck, ArrowRight, UserCircle2 } from 'lucide-react';
import './Login.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function ForgotPassword() {
    const [contact, setContact] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleSendCode = async () => {
        if (!contact) {
            setError('请输入手机号以获取验证码');
            return;
        }
        setError('');
        setMessage('');

        try {
            const res = await axios.post(`${API_BASE_URL}/auth/send-code`, { contact });
            setMessage(res.data.message || '验证码已发送，请注意查收（测试环境默认123456）');
            setCountdown(60);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('发送失败，请检查网络');
            }
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!contact || !code || !newPassword) {
            setError('请完整填写手机号、验证码和新密码');
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
                contact,
                code,
                new_password: newPassword
            });

            alert('密码重置成功，请使用新密码登录');
            navigate('/login');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('重置请求失败，请检查网络连接');
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
                        <h1 className="gradient-text">重置密码</h1>
                        <p>基于手机短信验证码进行快速找回</p>
                    </div>

                    <form onSubmit={handleResetPassword} className="login-form">
                        {error && <div className="error-message animate-fade-in">{error}</div>}
                        {message && <div style={{ background: '#dcfce3', color: '#166534', padding: '10px 15px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }} className="animate-fade-in">{message}</div>}

                        <div className="input-group delay-100">
                            <label>注册手机号码</label>
                            <div className="input-field">
                                <Smartphone size={20} className="input-icon" />
                                <input
                                    type="tel"
                                    placeholder="请输入绑定的手机号"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="input-group delay-200">
                            <label>短信验证码</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div className="input-field" style={{ flex: 1 }}>
                                    <ShieldCheck size={20} className="input-icon" />
                                    <input
                                        type="text"
                                        placeholder="请输入验证码"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <button
                                    type="button"
                                    disabled={countdown > 0 || loading}
                                    onClick={handleSendCode}
                                    style={{
                                        background: countdown > 0 ? '#9ca3af' : 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0 15px',
                                        cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                                        whiteSpace: 'nowrap',
                                        fontWeight: 600,
                                        transition: '0.3s'
                                    }}
                                >
                                    {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                                </button>
                            </div>
                        </div>

                        <div className="input-group delay-300">
                            <label>新密码</label>
                            <div className="input-field">
                                <Lock size={20} className="input-icon" />
                                <input
                                    type="password"
                                    placeholder="请输入新密码"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`submit-button delay-400 ${loading ? 'loading' : ''}`}
                            disabled={loading}
                            style={{ marginTop: '10px' }}
                        >
                            {loading ? '提交中...' : '确认重置'}
                            {!loading && <ArrowRight size={20} className="btn-icon" />}
                        </button>
                    </form>

                    <div className="login-footer delay-400">
                        <p>想起来了？ <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary)', marginLeft: '4px' }}>返回登录</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
