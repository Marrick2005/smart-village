import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

import DashboardStats from './admin/DashboardStats';
import FarmingBehavior from './admin/FarmingBehavior';
import VolunteerManagement from './admin/VolunteerManagement';
import VideoWatchRecords from './admin/VideoWatchRecords';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function AdminDashboard() {
    const [waterApps, setWaterApps] = useState([]);
    const [activities, setActivities] = useState([]);
    const [currentTab, setCurrentTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // New Activity Modal States
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [volunteers, setVolunteers] = useState([]);
    const [newActivity, setNewActivity] = useState({
        activity_name: '', activity_type: '志愿服务', start_time: '', end_time: '',
        village: '', activity_description: '', total_budget: 0, volunteer_ids: []
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userStr);
        if (user.identity_type !== '管理员') {
            navigate('/home');
            return;
        }
        fetchData();
    }, [currentTab]);

    const fetchData = async () => {
        setLoading(true);
        if (currentTab === 'water') {
            await fetchWaterApps();
        } else if (currentTab === 'activity') {
            await fetchActivities();
            await fetchVolunteersList();
        }
        setLoading(false);
    };

    const fetchVolunteersList = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/admin/volunteers/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVolunteers(res.data || []);
        } catch (err) {
            console.error('Failed to fetch volunteers list', err);
        }
    };

    const fetchWaterApps = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/farming/water-usage/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWaterApps(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch water apps', err);
        }
    };

    const fetchActivities = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/admin/activities`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActivities(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch activities', err);
        }
    };

    const handleApprove = async (id, status) => {
        let rejectReason = null;
        if (status === 2) {
            rejectReason = window.prompt("请输入拒绝理由:");
            if (rejectReason === null) return; // User cancelled
            if (!rejectReason.trim()) {
                alert("拒绝必须填写理由");
                return;
            }
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/farming/water-usage/${id}/status`, {
                status: status,
                reject_reason: rejectReason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchWaterApps();
        } catch (err) {
            alert('操作失败');
        }
    };

    const handleCreateActivity = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/admin/activities/new`, newActivity, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('活动创建成功');
            setShowActivityModal(false);
            setNewActivity({
                activity_name: '', activity_type: '志愿服务', start_time: '', end_time: '',
                village: '', activity_description: '', total_budget: 0, volunteer_ids: []
            });
            fetchActivities();
        } catch (err) {
            console.error(err);
            alert('创建失败，请检查输入');
        }
    };

    const toggleVolunteerSelection = (id) => {
        setNewActivity(prev => {
            const ids = prev.volunteer_ids;
            if (ids.includes(id)) {
                return { ...prev, volunteer_ids: ids.filter(vid => vid !== id) };
            } else {
                return { ...prev, volunteer_ids: [...ids, id] };
            }
        });
    };

    return (
        <div className="admin-container animate-fade-in">
            <nav className="navbar glass-panel">
                <div className="nav-brand gradient-text">数字大脑·后台管理</div>
                <div className="nav-user">
                    <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="logout-btn">退出</button>
                </div>
            </nav>

            <main className="admin-content">
                <div className="admin-header">
                    <h1>后台管理控制台</h1>
                    <div className="admin-tabs" style={{ flexWrap: 'wrap', gap: '10px' }}>
                        <button
                            className={`tab-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('dashboard')}
                        >
                            数据大屏
                        </button>
                        <button
                            className={`tab-btn ${currentTab === 'water' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('water')}
                        >
                            用水申请
                        </button>
                        <button
                            className={`tab-btn ${currentTab === 'activity' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('activity')}
                        >
                            公益活动
                        </button>
                        <button
                            className={`tab-btn ${currentTab === 'behavior' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('behavior')}
                        >
                            农事实践
                        </button>
                        <button
                            className={`tab-btn ${currentTab === 'volunteer' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('volunteer')}
                        >
                            志愿者反馈
                        </button>
                        <button
                            className={`tab-btn ${currentTab === 'video' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('video')}
                        >
                            视频观看
                        </button>
                        <button
                            className="tab-btn"
                            onClick={() => navigate('/admin/culture')}
                        >
                            文化管理
                        </button>
                    </div>
                </div>

                {currentTab === 'dashboard' && <DashboardStats />}
                {currentTab === 'behavior' && <FarmingBehavior />}
                {currentTab === 'volunteer' && <VolunteerManagement />}
                {currentTab === 'video' && <VideoWatchRecords />}

                {currentTab === 'water' && (
                    <div className="table-container glass-panel delay-100">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>申请人</th>
                                    <th>地点</th>
                                    <th>作物</th>
                                    <th>时长</th>
                                    <th>申请时间</th>
                                    <th>申请理由</th>
                                    <th>状态</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>加载中...</td></tr>
                                ) : waterApps.length === 0 ? (
                                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>暂无申请</td></tr>
                                ) : waterApps.map(app => (
                                    <tr key={app.id}>
                                        <td>{app.applicant}</td>
                                        <td>{app.village}</td>
                                        <td>{app.crop}</td>
                                        <td>{app.amount}</td>
                                        <td>{app.date}</td>
                                        <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={app.reason}>{app.reason}</td>
                                        <td>
                                            <span className={`status-badge status-${app.status}`}>
                                                {app.status === 0 ? '待审批' : app.status === 1 ? '已通过' : '已拒绝'}
                                            </span>
                                        </td>
                                        <td>
                                            {app.status === 0 && (
                                                <div className="action-btns">
                                                    <button className="btn-approve" onClick={() => handleApprove(app.id, 1)}>通过</button>
                                                    <button className="btn-reject" onClick={() => handleApprove(app.id, 2)}>拒绝</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {currentTab === 'activity' && (
                    <div className="table-container glass-panel delay-100">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>活动名册</h2>
                            <button onClick={() => setShowActivityModal(true)} style={{
                                padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
                            }}>+ 发布新活动</button>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>活动名称</th>
                                    <th>活动类型</th>
                                    <th>村庄</th>
                                    <th>开始时间</th>
                                    <th>预算</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>加载中...</td></tr>
                                ) : activities.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>暂无活动</td></tr>
                                ) : activities.map(act => (
                                    <tr key={act.activity_id}>
                                        <td>{act.activity_name}</td>
                                        <td>{act.activity_type}</td>
                                        <td>{act.village}</td>
                                        <td>{new Date(act.start_time).toLocaleDateString()}</td>
                                        <td>¥{act.total_budget}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* New Activity Modal */}
                {showActivityModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div className="glass-panel animate-fade-in" style={{
                            width: '500px', maxHeight: '90vh', overflowY: 'auto', background: 'white', padding: '25px', borderRadius: '12px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0, fontSize: '20px' }}>发布新公益活动</h2>
                                <button onClick={() => setShowActivityModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
                            </div>
                            <form onSubmit={handleCreateActivity} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div><label>活动名称</label><input required type="text" style={{ width: '100%', padding: '8px', marginTop: '5px' }} value={newActivity.activity_name} onChange={e => setNewActivity({ ...newActivity, activity_name: e.target.value })} /></div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ flex: 1 }}><label>类型</label>
                                        <select style={{ width: '100%', padding: '8px', marginTop: '5px' }} value={newActivity.activity_type} onChange={e => setNewActivity({ ...newActivity, activity_type: e.target.value })}>
                                            <option>志愿服务</option><option>乡村巡演</option><option>农技培训</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 1 }}><label>预算 (元)</label><input required type="number" style={{ width: '100%', padding: '8px', marginTop: '5px' }} value={newActivity.total_budget} onChange={e => setNewActivity({ ...newActivity, total_budget: parseFloat(e.target.value) })} /></div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ flex: 1 }}><label>开始时间</label><input required type="date" style={{ width: '100%', padding: '8px', marginTop: '5px' }} value={newActivity.start_time} onChange={e => setNewActivity({ ...newActivity, start_time: e.target.value })} /></div>
                                    <div style={{ flex: 1 }}><label>结束时间</label><input required type="date" style={{ width: '100%', padding: '8px', marginTop: '5px' }} value={newActivity.end_time} onChange={e => setNewActivity({ ...newActivity, end_time: e.target.value })} /></div>
                                </div>
                                <div><label>地点 (村庄)</label><input required type="text" style={{ width: '100%', padding: '8px', marginTop: '5px' }} value={newActivity.village} onChange={e => setNewActivity({ ...newActivity, village: e.target.value })} /></div>
                                <div><label>描述</label><textarea required rows="3" style={{ width: '100%', padding: '8px', marginTop: '5px' }} value={newActivity.activity_description} onChange={e => setNewActivity({ ...newActivity, activity_description: e.target.value })}></textarea></div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px' }}>指派志愿者队伍 ({newActivity.volunteer_ids.length}人已选)</label>
                                    <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '6px', padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {volunteers.map(v => (
                                            <label key={v.user_id} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                                                <input type="checkbox" checked={newActivity.volunteer_ids.includes(v.user_id)} onChange={() => toggleVolunteerSelection(v.user_id)} />
                                                {v.name}
                                            </label>
                                        ))}
                                        {volunteers.length === 0 && <span style={{ color: '#94a3b8', fontSize: '13px' }}>暂无注册的志愿者可以分配</span>}
                                    </div>
                                </div>

                                <button type="submit" style={{ padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, marginTop: '10px', cursor: 'pointer' }}>确认创建</button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
