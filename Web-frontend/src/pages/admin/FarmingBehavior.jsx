import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function FarmingBehavior() {
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/admin/farming-behavior`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTableData(res.data.data || []);
        } catch (error) {
            console.error('加载农事记录失败', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdopt = async (record_id) => {
        if (!window.confirm('确认将此条记录标记为已采纳此建议吗？')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/admin/farming-behavior/${record_id}/adopt`,
                { is_adopted: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (err) {
            alert('操作失败');
        }
    };

    return (
        <div className="table-container glass-panel delay-100">
            <div className="tab-header-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontWeight: 600 }}>农事实践打卡反馈</h3>
                <button className="btn-approve" onClick={fetchData} style={{ padding: '6px 12px' }}>刷新数据</button>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>记录ID</th>
                        <th>农户姓名</th>
                        <th>所属乡镇</th>
                        <th>作物类型</th>
                        <th>生长阶段</th>
                        <th>提醒类别</th>
                        <th>状态</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>加载中...</td></tr> :
                        tableData.length === 0 ? <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>暂无记录</td></tr> :
                            tableData.map(row => (
                                <tr key={row.record_id}>
                                    <td>{row.record_id}</td>
                                    <td>{row.user_name}</td>
                                    <td>{row.township}</td>
                                    <td>{row.crop_type}</td>
                                    <td>{row.farming_stage}</td>
                                    <td>{row.reminder_category}</td>
                                    <td>
                                        <span className={`status-badge ${row.is_adopted_advice ? 'status-1' : 'status-0'}`}>
                                            {row.is_adopted_advice ? '已采纳' : '未采纳'}
                                        </span>
                                    </td>
                                    <td>
                                        {!row.is_adopted_advice && (
                                            <button className="btn-approve" onClick={() => handleAdopt(row.record_id)}>标记为采纳</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                </tbody>
            </table>
        </div>
    );
}
