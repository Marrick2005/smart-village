import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Home.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function School() {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/school/videos?category=农业技术`);
                setVideos(res.data.videos || []);
            } catch (err) {
                console.error('获取视频失败');
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    const markAsWatched = async (videoId) => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);

        try {
            await axios.post(`${API_BASE_URL}/school/video/watch-record`, {
                video_id: videoId || 1,
                user_id: user.id || user.user_id,
                actual_watch_duration: 300,
                is_finished: true
            });
            alert('恭喜您完成学习！已成功记录本次观看。');
        } catch (err) {
            console.error('播放记录失败', err);
        }
    };

    return (
        <div className="home-container animate-fade-in">
            <nav className="navbar glass-panel">
                <div className="nav-brand gradient-text" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>← 返回数字大脑</div>
            </nav>
            <main className="dashboard-content">
                <header className="dashboard-header" style={{ textAlign: 'left', marginBottom: '20px' }}>
                    <h2 style={{ color: 'var(--secondary)', marginTop: 0 }}>🎓 乡村学堂 · 技能培训</h2>
                    <p>观看助农视频，学习先进农业技术</p>
                </header>

                {loading ? <p>加载视频中...</p> : (
                    <div className="modules-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                        {videos.length === 0 ? (
                            <div className="module-card glass-panel" style={{ gridColumn: '1 / -1', cursor: 'default' }}>
                                暂无推荐视频课程
                            </div>
                        ) : videos.map((video, idx) => (
                            <div key={idx} className="module-card glass-panel" style={{ textAlign: 'left', padding: '15px', display: 'flex', flexDirection: 'column' }}>
                                <video
                                    controls
                                    src={video.url}
                                    poster={video.cover}
                                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px', backgroundColor: '#000' }}
                                    onEnded={() => markAsWatched(video.id)}
                                >
                                    您的浏览器不支持 video 标签。
                                </video>
                                <h3 style={{ fontSize: '16px', margin: '0 0 10px 0' }}>{video.title}</h3>
                                <p style={{ fontSize: '13px', margin: '0 0 5px 0', color: 'var(--text-secondary)' }}>分类: {video.category}</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
