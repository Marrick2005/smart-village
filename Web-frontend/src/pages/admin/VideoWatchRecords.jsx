import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function VideoWatchRecords() {
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Video Management States
    const [videos, setVideos] = useState([]);
    const [videosLoading, setVideosLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newVideo, setNewVideo] = useState({
        video_topic: '', video_type: '农业技术', video_url: '', cover_url: '', video_duration: 0
    });
    const [detectingDuration, setDetectingDuration] = useState(false);

    // Auto-detect video duration when URL changes
    useEffect(() => {
        if (!newVideo.video_url || !newVideo.video_url.startsWith('http')) return;

        const detect = async () => {
            setDetectingDuration(true);
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = newVideo.video_url;

            video.onloadedmetadata = () => {
                const duration = Math.round(video.duration);
                setNewVideo(prev => ({ ...prev, video_duration: duration }));
                setDetectingDuration(false);
            };

            video.onerror = () => {
                console.warn('无法解析视频时长，请手动输入');
                setDetectingDuration(false);
            };
        };

        const timer = setTimeout(detect, 500); // Debounce
        return () => clearTimeout(timer);
    }, [newVideo.video_url]);

    // Details Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userHistory, setUserHistory] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    const fetchAllData = async () => {
        fetchData();
        fetchVideos();
    };

    const fetchVideos = async () => {
        setVideosLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/admin/videos/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos(res.data.data || []);
        } catch (error) {
            console.error('获取视频库失败', error);
        } finally {
            setVideosLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/school/video/records`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTableData(res.data.data || []);
        } catch (error) {
            console.error('获取视频观看记录失败', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllData(); }, []);

    const handleAddVideo = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/admin/videos/new`, newVideo, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('视频添加成功');
            setShowAddModal(false);
            setNewVideo({ video_topic: '', video_type: '农业技术', video_url: '', cover_url: '', video_duration: 0 });
            fetchVideos();
        } catch (err) {
            alert('添加视频失败');
        }
    };

    const handleDeleteVideo = async (id) => {
        if (!window.confirm('确定要删除该视频吗？删除后不可恢复。')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/admin/videos/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('视频已删除');
            fetchVideos();
        } catch (err) {
            alert('删除视频失败');
        }
    };

    const showUserDetails = async (user) => {
        setCurrentUser(user);
        setModalVisible(true);
        setModalLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/school/user/${user.user_id}/videos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserHistory(res.data || []);
        } catch (error) {
            console.error('获取个人明细失败', error);
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Video Management Section */}
            <div className="table-container glass-panel delay-100 relative">
                <div className="tab-header-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontWeight: 600 }}>🎬 视频库管理</h3>
                    <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white' }}>+ 新增视频</button>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>视频标题</th>
                            <th>分类</th>
                            <th>播放链接</th>
                            <th>封面链接</th>
                            <th>时长(秒)</th>
                            <th style={{ textAlign: 'center' }}>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {videosLoading ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>加载中...</td></tr> :
                            videos.length === 0 ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', borderBottom: 'none' }}>暂无视频，请点击上方按钮添加</td></tr> :
                                videos.map(v => (
                                    <tr key={v.video_id}>
                                        <td style={{ fontWeight: 500 }}>{v.video_topic}</td>
                                        <td>{v.video_type}</td>
                                        <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={v.video_url}>{v.video_url}</td>
                                        <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={v.cover_url}>{v.cover_url}</td>
                                        <td>{v.video_duration}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button className="btn-reject" style={{ padding: '4px 10px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleDeleteVideo(v.video_id)}>
                                                删除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>

            {/* Watch Records Section */}
            <div className="table-container glass-panel delay-100 relative">
                <div className="tab-header-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, fontWeight: 600 }}>👁️ 农户观看记录汇总</h3>
                    <button className="btn-approve" onClick={fetchAllData} style={{ padding: '6px 12px' }}>刷新数据</button>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>农户姓名</th>
                            <th>所属乡镇</th>
                            <th style={{ textAlign: 'center' }}>累计观看时长 (秒)</th>
                            <th style={{ textAlign: 'center' }}>已完课数量</th>
                            <th style={{ textAlign: 'center' }}>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>加载中...</td></tr> :
                            tableData.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>暂无记录</td></tr> :
                                tableData.map(row => (
                                    <tr key={row.user_id}>
                                        <td style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }} onClick={() => showUserDetails(row)}>
                                            {row.username}
                                        </td>
                                        <td>{row.township}</td>
                                        <td style={{ textAlign: 'center' }}>{row.total_duration}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`status-badge ${row.finished_count > 0 ? 'status-1' : 'status-0'}`}>
                                                {row.finished_count} 部
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => showUserDetails(row)}>
                                                查看清单
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>

                {/* Simple Modal overlay for details */}
                {modalVisible && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <div className="modal-content glass-panel" style={{
                            background: 'white', width: '600px', maxWidth: '90%',
                            borderRadius: '12px', padding: '20px', maxHeight: '80vh', overflowY: 'auto'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                                <h3 style={{ margin: 0 }}>【{currentUser?.username}】的观看清单</h3>
                                <button onClick={() => setModalVisible(false)} style={{
                                    background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666'
                                }}>×</button>
                            </div>

                            <table className="admin-table" style={{ marginTop: '10px' }}>
                                <thead>
                                    <tr>
                                        <th>已观视频</th>
                                        <th>观看时刻</th>
                                        <th>时长(秒)</th>
                                        <th>状态</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modalLoading ? <tr><td colSpan="4" style={{ textAlign: 'center' }}>加载明细中...</td></tr> :
                                        userHistory.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center' }}>暂无明细</td></tr> :
                                            userHistory.map(history => (
                                                <tr key={history.watch_time}>
                                                    <td>{history.video_title}</td>
                                                    <td>{new Date(history.watch_time).toLocaleString()}</td>
                                                    <td style={{ textAlign: 'center' }}>{history.duration}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span className={`status-badge ${history.is_finished ? 'status-1' : 'status-0'}`}>
                                                            {history.is_finished ? '已完课' : '未完'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Add Video Modal */}
                {showAddModal && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="modal-content glass-panel animate-fade-in" style={{ background: 'white', width: '500px', borderRadius: '12px', padding: '25px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '20px' }}>新增教育视频</h3>
                                <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>×</button>
                            </div>
                            <form onSubmit={handleAddVideo} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div><label>视频标题</label><input required type="text" style={{ width: '100%', padding: '8px', marginTop: '5px' }} value={newVideo.video_topic} onChange={e => setNewVideo({ ...newVideo, video_topic: e.target.value })} /></div>
                                <div>
                                    <label>分类</label>
                                    <select style={{ width: '100%', padding: '8px', marginTop: '5px' }} value={newVideo.video_type} onChange={e => setNewVideo({ ...newVideo, video_type: e.target.value })}>
                                        <option>农业技术</option><option>儿童动画</option><option>文化宣传</option>
                                    </select>
                                </div>
                                <div><label>播放链接 (URL)</label><input required type="url" style={{ width: '100%', padding: '8px', marginTop: '5px' }} placeholder="如：http://127.0.0.1:8000/uploads/demo.mp4" value={newVideo.video_url} onChange={e => setNewVideo({ ...newVideo, video_url: e.target.value })} /></div>
                                <div><label>封面图片链接 (URL)</label><input required type="url" style={{ width: '100%', padding: '8px', marginTop: '5px' }} value={newVideo.cover_url} onChange={e => setNewVideo({ ...newVideo, cover_url: e.target.value })} /></div>
                                <div>
                                    <label>视频时长 (秒) {detectingDuration && <span style={{ color: 'var(--primary)', fontSize: '12px' }}> (🔍 正在自动识别...)</span>}</label>
                                    <input required type="number" style={{ width: '100%', padding: '8px', marginTop: '5px', backgroundColor: detectingDuration ? '#f0f9ff' : 'white' }} value={newVideo.video_duration} onChange={e => setNewVideo({ ...newVideo, video_duration: parseInt(e.target.value) || 0 })} placeholder="识别中..." />
                                </div>
                                <button type="submit" disabled={detectingDuration} style={{ padding: '12px', background: detectingDuration ? '#ccc' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, marginTop: '10px', cursor: detectingDuration ? 'not-allowed' : 'pointer' }}>
                                    {detectingDuration ? '识别视频中...' : '确认添加'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
