import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Home.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function Culture() {
    const navigate = useNavigate();
    const [landmarks, setLandmarks] = useState([]);
    const [loadingLandmarks, setLoadingLandmarks] = useState(true);

    useEffect(() => {
        const fetchLandmarks = async () => {
            setLoadingLandmarks(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/culture/red-landmarks`);
                if (res.data && res.data.landmarks) {
                    setLandmarks(res.data.landmarks);
                } else {
                    setLandmarks([]);
                }
            } catch (err) {
                console.error('获取地标失败', err);
                setLandmarks([]);
            } finally {
                setLoadingLandmarks(false);
            }
        };
        fetchLandmarks();
    }, []);

    return (
        <div className="home-container animate-fade-in" style={{ paddingBottom: '50px' }}>
            <nav className="navbar glass-panel">
                <div className="nav-brand gradient-text" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>← 返回数字大脑</div>
            </nav>
            <main className="dashboard-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header className="dashboard-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ color: '#F59E0B', marginTop: 0, fontSize: '28px' }}>🎭 文化融合 · 红色足迹</h2>
                    <p style={{ fontSize: '16px', color: '#64748b' }}>探索涉县革命老区地标，分享你的方言故事</p>
                </header>

                <div className="module-card glass-panel delay-100" style={{ textAlign: 'left', cursor: 'default' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', color: '#334155' }}>📍 红色文化地标</h3>
                    </div>
                    
                    {loadingLandmarks ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto 15px auto' }}></div>
                            加载地标数据中...
                        </div>
                    ) : landmarks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>暂无地标信息，请联系管理员添加</div>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                            gap: '20px' 
                        }}>
                            {landmarks.map(lm => (
                                <div 
                                    key={lm.landmark_id} 
                                    onClick={() => navigate(`/culture/landmark/${lm.landmark_id}`)}
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        cursor: 'pointer',
                                        background: 'rgba(255,255,255,0.7)',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
                                        e.currentTarget.style.border = '1px solid #FDE68A';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.border = '1px solid #e2e8f0';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '18px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {lm.title}
                                        </h4>
                                        <div style={{ background: '#FEF3C7', color: '#D97706', padding: '4px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                                            红色遗址
                                        </div>
                                    </div>
                                    <p style={{ 
                                        margin: 0, 
                                        color: '#64748b', 
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        flexGrow: 1
                                    }}>
                                        {lm.description || '暂无详细介绍'}
                                    </p>
                                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', color: '#F59E0B', fontSize: '13px', fontWeight: 'bold' }}>
                                        点击进入详情探讨 →
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
