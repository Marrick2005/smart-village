import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Home.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function VolunteerHome() {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    // Feedback Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [currentActivity, setCurrentActivity] = useState(null);
    const [feedback, setFeedback] = useState({
        personal_gain_score: 5,
        organization_score: 5,
        satisfaction_score: 5,
        improvement_suggestion: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userStr);
        if (user.identity_type !== '志愿者') {
            navigate('/home');
            return;
        }
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/volunteer/activities`);
            setActivities(res.data.data || []);
        } catch (error) {
            console.error('加载活动失败', error);
        } finally {
            setLoading(false);
        }
    };

    const openFeedbackModal = (act) => {
        setCurrentActivity(act);
        setFeedback({
            personal_gain_score: 5,
            organization_score: 5,
            satisfaction_score: 5,
            improvement_suggestion: ''
        });
        setModalVisible(true);
    };

    const submitFeedback = async (e) => {
        e.preventDefault();
        if (!feedback.improvement_suggestion.trim()) {
            return alert('请输入一点改进建议吧～');
        }
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/volunteer/activities/${currentActivity.activity_id}/feedback`, feedback, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message);
            setModalVisible(false);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.detail) {
                alert(error.response.data.detail);
            } else {
                alert('提交失败，请稍后再试');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleScoreChange = (type, value) => {
        setFeedback(prev => ({ ...prev, [type]: parseFloat(value) }));
    };

    const StarRating = ({ value, onChange }) => {
        return (
            <div style={{ display: 'flex', gap: '5px', fontSize: '24px', cursor: 'pointer', color: '#cbd5e1' }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={star}
                        onClick={() => onChange(star)}
                        style={{ color: star <= value ? '#F59E0B' : '#cbd5e1' }}
                    >★</span>
                ))}
            </div>
        );
    };

    return (
        <div className="home-container animate-fade-in">
            <nav className="navbar glass-panel">
                <div className="nav-brand gradient-text">数字大脑·志愿者工作台</div>
                <div className="nav-user">
                    <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="logout-btn">退出</button>
                </div>
            </nav>

            <main className="dashboard-content">
                <header className="dashboard-header" style={{ textAlign: 'left', marginBottom: '20px' }}>
                    <h2>公益活动墙</h2>
                    <p>浏览最新的下乡帮扶活动，参与并留下您宝贵的反馈。</p>
                </header>

                {loading ? <p>加载中...</p> : (
                    <div className="modules-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        {activities.length === 0 ? (
                            <div className="module-card glass-panel" style={{ gridColumn: '1 / -1', cursor: 'default' }}>
                                暂无近期活动发布
                            </div>
                        ) : activities.map(act => (
                            <div key={act.activity_id} className="module-card glass-panel delay-100" style={{ textAlign: 'left', cursor: 'default' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <h3 style={{ margin: 0, color: 'var(--primary)' }}>{act.activity_name}</h3>
                                    <span style={{ fontSize: '12px', padding: '4px 8px', background: '#e0e7ff', color: '#4338ca', borderRadius: '4px' }}>{act.activity_type}</span>
                                </div>
                                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <span>📍 开展乡村: {act.village}</span>
                                    <span>🕒 开始时间: {act.start_time}</span>
                                </div>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '15px' }}>{act.description}</p>

                                <button onClick={() => openFeedbackModal(act)} style={{
                                    width: '100%', padding: '10px', background: '#F59E0B', color: 'white',
                                    border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500
                                }}>
                                    打分并发表反馈
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Feedback Modal */}
            {modalVisible && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="glass-panel" style={{
                        background: 'white', width: '500px', maxWidth: '90%',
                        borderRadius: '12px', padding: '25px', maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>活动反馈: {currentActivity?.activity_name}</h3>
                            <button onClick={() => setModalVisible(false)} style={{
                                background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666'
                            }}>×</button>
                        </div>

                        <form onSubmit={submitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>个人能力提升 (1-5星)</label>
                                <StarRating value={feedback.personal_gain_score} onChange={(v) => handleScoreChange('personal_gain_score', v)} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>组织协调水平 (1-5星)</label>
                                <StarRating value={feedback.organization_score} onChange={(v) => handleScoreChange('organization_score', v)} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>整体活动满意度 (1-5星)</label>
                                <StarRating value={feedback.satisfaction_score} onChange={(v) => handleScoreChange('satisfaction_score', v)} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>改进建议留声</label>
                                <textarea
                                    value={feedback.improvement_suggestion}
                                    onChange={e => setFeedback({ ...feedback, improvement_suggestion: e.target.value })}
                                    rows="4"
                                    placeholder="请分享您在这次活动中发现的问题和更好的建议..."
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" disabled={submitting} style={{
                                padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 600
                            }}>
                                {submitting ? '提交中...' : '提交活动反馈'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
