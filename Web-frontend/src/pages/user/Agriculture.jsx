import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Home.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function Agriculture() {
    const navigate = useNavigate();
    const [cropType, setCropType] = useState('核桃');
    const [stage, setStage] = useState('果实膨大期');
    const [duration, setDuration] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [quota, setQuota] = useState(0);
    const [myApps, setMyApps] = useState([]);
    const [showMyApps, setShowMyApps] = useState(false);

    // Intelligent Decision States
    const [decisionLoading, setDecisionLoading] = useState(false);
    const [decisionResult, setDecisionResult] = useState(null);
    const [weather, setWeather] = useState(null);

    // Farming Behavior States
    const [behaviorCrop, setBehaviorCrop] = useState('核桃');
    const [behaviorStage, setBehaviorStage] = useState('果实膨大期');
    const [behaviorCategory, setBehaviorCategory] = useState('水分管理');
    const [behaviorLoading, setBehaviorLoading] = useState(false);
    const [myBehaviors, setMyBehaviors] = useState([]);
    const [showMyBehaviors, setShowMyBehaviors] = useState(false);

    useEffect(() => {
        const fetchQuota = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/farming/water-usage-quota`);
                setQuota(res.data.quota_hours);
            } catch (err) {
                console.error('获取配额失败');
            }
        };
        const fetchWeather = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/farming/weather`);
                setWeather(res.data);
            } catch (err) {
                console.error('获取天气信息失败');
            }
        };
        fetchQuota();
        fetchWeather();
    }, []);

    const fetchMyApps = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/farming/water-usage/my-applications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyApps(res.data.data || []);
        } catch (err) {
            console.error('获取我的申请失败');
        }
    };

    const toggleMyApps = () => {
        if (!showMyApps) {
            fetchMyApps();
        }
        setShowMyApps(!showMyApps);
    };

    const getIrrigationDecision = async () => {
        setDecisionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/farming/irrigation-decision`, {
                crop_type: cropType,
                stage: stage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDecisionResult(res.data.decision);
        } catch (err) {
            console.error('获取气象与灌溉决策失败', err);
            setDecisionResult('无法获取决策建议，请稍后再试。');
        } finally {
            setDecisionLoading(false);
        }
    };

    const submitApplication = async (e) => {
        e.preventDefault();
        if (!duration || !reason) return alert('请完整填写申请');
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/farming/water-usage-apply`, {
                crop_type: cropType,
                duration: parseFloat(duration),
                reason: reason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message);
            navigate('/home');
        } catch (err) {
            alert('申请失败');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyBehaviors = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/farming/behavior/my-records`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyBehaviors(res.data.data || []);
        } catch (err) {
            console.error('获取我的农事实践记录失败');
        }
    };

    const toggleMyBehaviors = () => {
        if (!showMyBehaviors) {
            fetchMyBehaviors();
        }
        setShowMyBehaviors(!showMyBehaviors);
    };

    const submitBehavior = async (e) => {
        e.preventDefault();
        setBehaviorLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/farming/behavior-checkin`, {
                crop_type: behaviorCrop,
                farming_stage: behaviorStage,
                reminder_category: behaviorCategory
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message);
            if (showMyBehaviors) fetchMyBehaviors();
        } catch (err) {
            alert('打卡失败');
        } finally {
            setBehaviorLoading(false);
        }
    };

    return (
        <div className="home-container animate-fade-in">
            <nav className="navbar glass-panel">
                <div className="nav-brand gradient-text" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>← 返回数字大脑</div>
            </nav>
            <main className="dashboard-content">
                <div className="module-card glass-panel" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left', display: 'block', cursor: 'default' }}>
                    <h2 style={{ marginTop: 0, color: 'var(--primary)' }}>🌱 智慧助农 · 智能灌溉与申请</h2>
                    <p style={{ marginBottom: '20px' }}>当前剩余分红用水配额: <strong>{quota} 小时</strong></p>

                    {/* Real-time Weather Section */}
                    {weather && (
                        <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', padding: '15px 20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <div>
                                <div style={{ fontSize: '14px', marginBottom: '4px', opacity: 0.9 }}>{weather.date}</div>
                                <div style={{ fontSize: '24px', fontWeight: 600 }}>{weather.condition}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '28px', fontWeight: 700 }}>{weather.temperature}</div>
                                <div style={{ fontSize: '12px', opacity: 0.9, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <span>湿度: {weather.humidity} | 降水: {weather.precip}</span>
                                    <span>风向: {weather.windDir} | 气压: {weather.pressure}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Intelligent Decision Section */}
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>🤖 智能灌溉预测</h3>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                            <select value={cropType} onChange={e => { setCropType(e.target.value); setDecisionResult(null); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                <option>核桃</option>
                                <option>花椒</option>
                                <option>苹果</option>
                                <option>蔬菜</option>
                            </select>
                            <select value={stage} onChange={e => { setStage(e.target.value); setDecisionResult(null); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                <option>果实膨大期</option>
                                <option>苗期</option>
                                <option>花期</option>
                                <option>成熟期</option>
                            </select>
                            <button onClick={getIrrigationDecision} disabled={decisionLoading} style={{
                                padding: '10px 15px', background: 'var(--secondary)', color: 'white', border: 'none', borderRadius: '8px', cursor: decisionLoading ? 'not-allowed' : 'pointer', fontWeight: 500, whiteSpace: 'nowrap'
                            }}>
                                {decisionLoading ? '分析中...' : '获取浇灌建议'}
                            </button>
                        </div>
                        {decisionResult && (
                            <div className="animate-fade-in" style={{ padding: '12px', background: '#e0e7ff', color: '#4338ca', borderRadius: '6px', fontSize: '14px', lineHeight: 1.5 }}>
                                💡 <strong>决策建议：</strong>{decisionResult}
                            </div>
                        )}
                    </div>

                    <form onSubmit={submitApplication} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>若需浇灌，请填写申请时长 (小时)</label>
                            <input type="number" step="0.5" value={duration} onChange={e => setDuration(e.target.value)} placeholder="例如: 2.5" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>申请理由</label>
                            <textarea value={reason} onChange={e => setReason(e.target.value)} rows="3" placeholder="请简述缺水情况..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}></textarea>
                        </div>
                        <button type="submit" disabled={loading} style={{
                            padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600
                        }}>
                            {loading ? '提交中...' : '提交审批申请'}
                        </button>
                    </form>

                    <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0 }}>我的申请记录</h3>
                            <button onClick={toggleMyApps} style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'var(--primary)', fontWeight: 500 }}>
                                {showMyApps ? '收起列表' : '查看我的申请'}
                            </button>
                        </div>

                        {showMyApps && (
                            <div className="my-apps-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {myApps.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>暂无申请记录</p>
                                ) : myApps.map(app => (
                                    <div key={app.id} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 600 }}>{app.crop} - {app.amount}</span>
                                            <span className={`status-badge status-${app.status}`}>
                                                {app.status === 0 ? '待审批' : app.status === 1 ? '已通过' : '已拒绝'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '5px' }}>申请时间：{app.date}</div>
                                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>理由：{app.reason}</div>
                                        {app.status === 2 && app.reject_reason && (
                                            <div style={{ marginTop: '8px', padding: '8px', background: '#fee2e2', color: '#dc2626', borderRadius: '4px', fontSize: '13px' }}>
                                                <strong>拒绝理由：</strong>{app.reject_reason}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Farming Behavior Section */}
                    <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px dashed #e2e8f0' }}>
                        <h2 style={{ marginTop: 0, color: 'var(--primary)' }}>📋 农事实践 · 每日打卡</h2>
                        <p style={{ marginBottom: '20px' }}>记录您每日的农事活动，系统管理员会根据您的反馈提供专业建议采纳。</p>
                        
                        <form onSubmit={submitBehavior} style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>作物种类</label>
                                    <select value={behaviorCrop} onChange={e => setBehaviorCrop(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                        <option>核桃</option><option>花椒</option><option>苹果</option><option>蔬菜</option><option>其他</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>农事阶段</label>
                                    <select value={behaviorStage} onChange={e => setBehaviorStage(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                        <option>播种期</option><option>苗期</option><option>花期</option><option>果实膨大期</option><option>成熟采收期</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>处理事项类别</label>
                                    <select value={behaviorCategory} onChange={e => setBehaviorCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                        <option>水分管理</option><option>病虫害防治</option><option>施肥防冻</option><option>修剪授粉</option><option>巡查记录</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" disabled={behaviorLoading} style={{
                                padding: '12px', background: 'var(--secondary)', color: 'white', border: 'none', borderRadius: '8px', cursor: behaviorLoading ? 'not-allowed' : 'pointer', fontWeight: 600, marginTop: '5px'
                            }}>
                                {behaviorLoading ? '提交打卡中...' : '提交今日农事打卡'}
                            </button>
                        </form>

                        <div style={{ marginTop: '25px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0 }}>我的打卡记录</h3>
                                <button onClick={toggleMyBehaviors} style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'var(--primary)', fontWeight: 500 }}>
                                    {showMyBehaviors ? '收起列表' : '查看打卡历史'}
                                </button>
                            </div>

                            {showMyBehaviors && (
                                <div className="my-apps-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {myBehaviors.length === 0 ? (
                                        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>暂无打卡记录</p>
                                    ) : myBehaviors.map(record => (
                                        <div key={record.record_id} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 600, fontSize: '15px' }}>{record.crop_type} - {record.farming_stage}</span>
                                                <span className={`status-badge ${record.is_adopted_advice ? 'status-1' : 'status-0'}`}>
                                                    {record.is_adopted_advice ? '专家已采纳指导' : '等待专家查阅'}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '5px' }}>打卡时间：{record.record_time}</div>
                                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>处理事项：{record.reminder_category}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
