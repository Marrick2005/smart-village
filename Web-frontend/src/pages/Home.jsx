import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userInfo = localStorage.getItem('user');

        if (!token || !userInfo) {
            navigate('/login');
            return;
        }

        try {
            setUser(JSON.parse(userInfo));
        } catch (e) {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return <div className="loading-screen">加载中...</div>;

    return (
        <div className="home-container animate-fade-in">
            <nav className="navbar glass-panel">
                <div className="nav-brand gradient-text">数字大脑</div>
                <div className="nav-user">
                    <span className="user-name">你好，{user.name}</span>
                    <span className="user-badge">{user.identity_type}</span>
                    <button onClick={handleLogout} className="logout-btn">退出登录</button>
                </div>
            </nav>

            <main className="dashboard-content">
                <header className="dashboard-header delay-100">
                    <h1>欢迎来到涉县乡村公益数字大脑</h1>
                    <p>您已成功登录系统，以下是您可以使用的功能模块</p>
                </header>

                <div className="modules-grid delay-200">
                    <div className="module-card glass-panel" style={{ cursor: 'pointer' }} onClick={() => navigate('/agriculture')}>
                        <div className="module-icon" style={{ background: 'var(--primary)' }}>🌱</div>
                        <h3>智慧助农</h3>
                        <p>实时农业指导、病虫害预警与在线求助</p>
                    </div>
                    <div className="module-card glass-panel" style={{ cursor: 'pointer' }} onClick={() => navigate('/school')}>
                        <div className="module-icon" style={{ background: 'var(--secondary)' }}>🎓</div>
                        <h3>乡村学堂</h3>
                        <p>线上课程、留守老人儿童关爱陪伴打卡</p>
                    </div>
                    <div className="module-card glass-panel" style={{ cursor: 'pointer' }} onClick={() => navigate('/culture')}>
                        <div className="module-icon" style={{ background: '#F59E0B' }}>🎭</div>
                        <h3>文化融合</h3>
                        <p>方言故事分享、民俗文化传承与记录</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
