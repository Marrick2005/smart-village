import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function VolunteerManagement() {
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/admin/volunteers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTableData(res.data.data || []);
        } catch (error) {
            console.error('加载志愿者反馈记录失败', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const renderStars = (score) => {
        return '★'.repeat(Math.round(score)) + '☆'.repeat(5 - Math.round(score)) + ` (${score})`;
    };

    return (
        <div className="table-container glass-panel delay-100">
            <div className="tab-header-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontWeight: 600, marginLeft: '15px' }}>志愿者管理与活动反馈</h3>
                <button className="btn-approve" onClick={fetchData} style={{ padding: '6px 12px' }}>刷新数据</button>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>反馈ID</th>
                        <th>志愿者姓名</th>
                        <th>参与活动</th>
                        <th>个人收获</th>
                        <th>组织协调</th>
                        <th>满意度</th>
                        <th>改进建议</th>
                        <th>提交时间</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>加载中...</td></tr> :
                        tableData.length === 0 ? <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>暂无记录</td></tr> :
                            tableData.map(row => (
                                <tr key={row.feedback_id}>
                                    <td>{row.feedback_id}</td>
                                    <td>{row.user_name}</td>
                                    <td>{row.activity_name}</td>
                                    <td style={{ color: '#F59E0B' }}>{renderStars(row.personal_gain_score)}</td>
                                    <td style={{ color: '#F59E0B' }}>{renderStars(row.organization_score)}</td>
                                    <td style={{ color: '#F59E0B' }}>{renderStars(row.satisfaction_score)}</td>
                                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.improvement_suggestion}>
                                        {row.improvement_suggestion}
                                    </td>
                                    <td>{new Date(row.submit_time).toLocaleString()}</td>
                                </tr>
                            ))}
                </tbody>
            </table>
        </div>
    );
}
