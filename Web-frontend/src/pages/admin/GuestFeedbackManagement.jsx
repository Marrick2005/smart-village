import { useState, useEffect } from 'react';
import axios from 'axios';
import '../Admin.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function GuestFeedbackManagement() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/admin/guest-feedbacks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFeedbacks(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch guest feedbacks', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="table-container glass-panel delay-100 animate-fade-in">
            <div className="tab-header-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontWeight: 600, marginLeft: '15px' }}>游客意见反馈墙</h3>
                <button className="btn-approve" onClick={fetchFeedbacks} style={{ padding: '6px 12px' }}>刷新数据</button>
            </div>
            
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>反馈ID</th>
                        <th>提交时间</th>
                        <th>反馈内容</th>
                        <th>附图查看</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>加载中...</td></tr>
                    ) : feedbacks.length === 0 ? (
                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>暂无游客反馈记录</td></tr>
                    ) : feedbacks.map(f => (
                        <tr key={f.feedback_id}>
                            <td>{f.feedback_id}</td>
                            <td>{new Date(f.submit_time).toLocaleString()}</td>
                            <td style={{ maxWidth: '400px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{f.content}</td>
                            <td>
                                {f.image_url ? (
                                    <a href={f.image_url.startsWith('http') ? f.image_url : `http://127.0.0.1:8000${f.image_url}`} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>查看照片</a>
                                ) : (
                                    <span style={{ color: '#9ca3af' }}>无附图</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
