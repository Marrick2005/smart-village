import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Smartphone, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import './Login.css'; // Reusing Login.css for consistency

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function Register() {
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [password, setPassword] = useState('');
    const [identityType, setIdentityType] = useState('农户'); // Default to farmer
    const [gender, setGender] = useState('男');
    const [township, setTownship] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!name || !contact || !password || !township) {
            setError('请填写所有必填字段');
            return;
        }

        try {
            setLoading(true);
            await axios.post(`${API_BASE_URL}/auth/register`, {
                name,
                contact,
                password,
                identity_type: identityType,
                gender,
                township
            });

            // Success, go to login
            alert('注册成功，请使用新账号登录');
            navigate('/login');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('注册失败，请稍后重试');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container" style={{ overflowY: 'auto', padding: '20px 0' }}>
            <div className="login-background">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
            </div>

            <div className="login-content animate-fade-in" style={{ padding: '40px 0' }}>
                <div className="login-card glass-panel" style={{ marginTop: '20px', marginBottom: '40px' }}>
                    <div className="login-header">
                        <h1 className="gradient-text">加入数字大脑</h1>
                        <p>创建一个新账户以开启您的智慧乡村之旅</p>
                    </div>

                    <form onSubmit={handleRegister} className="login-form">
                        {error && <div className="error-message animate-fade-in">{error}</div>}

                        <div className="input-group delay-100">
                            <label>您的姓名</label>
                            <div className="input-field">
                                <User size={20} className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="请输入姓名"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="input-group delay-100" style={{ marginBottom: '15px' }}>
                            <label>性别</label>
                            <div style={{ display: 'flex', gap: '20px', padding: '10px 0' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                                    <input 
                                        type="radio" 
                                        name="gender" 
                                        value="男" 
                                        checked={gender === '男'} 
                                        onChange={(e) => setGender(e.target.value)}
                                        disabled={loading}
                                        style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }}
                                    />
                                    <span>男</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                                    <input 
                                        type="radio" 
                                        name="gender" 
                                        value="女" 
                                        checked={gender === '女'} 
                                        onChange={(e) => setGender(e.target.value)}
                                        disabled={loading}
                                        style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }}
                                    />
                                    <span>女</span>
                                </label>
                            </div>
                        </div>

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
                            <label>所属乡镇</label>
                            <div className="input-field">
                                <span className="input-icon" style={{ fontSize: '18px', display: 'flex', alignItems: 'center' }}>🏙️</span>
                                <input
                                    type="text"
                                    placeholder="请输入所属乡镇 (如: 某某镇某某村)"
                                    value={township}
                                    onChange={(e) => setTownship(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="input-group delay-200">
                            <label>设置密码</label>
                            <div className="input-field">
                                <Lock size={20} className="input-icon" />
                                <input
                                    type="password"
                                    placeholder="请设置登录密码"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="input-group delay-200" style={{ marginBottom: '15px' }}>
                            <label>选择角色</label>
                            <div style={{ display: 'flex', gap: '20px', padding: '10px 0' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                                    <input 
                                        type="radio" 
                                        name="identityType" 
                                        value="农户" 
                                        checked={identityType === '农户'} 
                                        onChange={(e) => setIdentityType(e.target.value)}
                                        disabled={loading}
                                        style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }}
                                    />
                                    <span>村民/农户</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                                    <input 
                                        type="radio" 
                                        name="identityType" 
                                        value="志愿者" 
                                        checked={identityType === '志愿者'} 
                                        onChange={(e) => setIdentityType(e.target.value)}
                                        disabled={loading}
                                        style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }}
                                    />
                                    <span>志愿者</span>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`submit-button delay-300 ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? '注册中...' : '立即注册'}
                            {!loading && <ArrowRight size={20} className="btn-icon" />}
                        </button>
                    </form>

                    <div className="login-footer delay-300">
                        <Link to="/login" className="flex-center" style={{ gap: '8px' }}>
                            <ArrowLeft size={16} /> 返回登录
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
