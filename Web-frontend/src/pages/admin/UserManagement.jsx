import { useState, useEffect } from 'react';
import axios from 'axios';
import '../Admin.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [filters, setFilters] = useState({ name: '', township: '', identityType: '' });
    const [loading, setLoading] = useState(false);

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data.data || [];

            // Sort users by identity_type: 管理员 -> 志愿者 -> 农户
            const order = { '管理员': 1, '志愿者': 2, '农户': 3 };
            data.sort((a, b) => {
                const orderA = order[a.identity_type] || 99;
                const orderB = order[b.identity_type] || 99;
                return orderA - orderB;
            });

            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user) => {
        setEditingUser({ ...user });
        setShowEditModal(true);
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/admin/users/${editingUser.user_id}`, editingUser, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('用户信息更新成功');
            setShowEditModal(false);
            fetchUsers();
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.detail) {
                alert(`更新失败: ${err.response.data.detail}`);
            } else {
                alert('更新失败，请重试');
            }
        }
    };

    const handleDeleteClick = async (userId, userName) => {
        if (!window.confirm(`确定要删除用户 "${userName}" 吗？此操作不可恢复。`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert('删除失败');
        }
    };

    return (
        <div className="table-container glass-panel delay-100 animate-fade-in">
            <div className="tab-header-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)', marginLeft: '15px' }}>用户管理</h2>
                    <input type="text" placeholder="搜索姓名" value={filters.name} onChange={e => setFilters({...filters, name: e.target.value})} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', marginLeft: '10px' }} />
                    <input type="text" placeholder="筛选所属村镇" value={filters.township} onChange={e => setFilters({...filters, township: e.target.value})} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <select value={filters.identityType} onChange={e => setFilters({...filters, identityType: e.target.value})} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="">身份 (全部)</option>
                        <option value="管理员">管理员</option>
                        <option value="志愿者">志愿者</option>
                        <option value="农户">农户</option>
                    </select>
                    <button className="btn-approve" onClick={() => setFilters({name:'', township:'', identityType:''})} style={{ padding: '6px 12px', background: '#9ca3af' }}>重置</button>
                </div>
                <button className="btn-approve" onClick={fetchUsers} style={{ padding: '6px 12px' }}>刷新数据</button>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>姓名</th>
                        <th>所属乡镇</th>
                        <th>联系电话</th>
                        <th>密码</th>
                        <th>身份类型</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>加载中...</td></tr>
                    ) : (() => {
                        const filteredUsers = users.filter(user => {
                            if (filters.name && !user.name.includes(filters.name)) return false;
                            if (filters.township && !(user.township && user.township.includes(filters.township))) return false;
                            if (filters.identityType && user.identity_type !== filters.identityType) return false;
                            return true;
                        });
                        
                        if (filteredUsers.length === 0) {
                            return <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>暂无符合条件的用户</td></tr>;
                        }

                        return filteredUsers.map(user => (
                            <tr key={user.user_id}>
                                <td>{user.name}</td>
                                <td>{user.township || <span style={{color: '#9ca3af'}}>-</span>}</td>
                                <td>{user.contact}</td>
                                <td style={{ WebkitTextSecurity: 'disc' }}>{user.password}</td>
                                <td>
                                    <span className="status-badge" style={{ 
                                        background: user.identity_type === '管理员' ? '#fecaca' : (user.identity_type === '志愿者' ? '#e0e7ff' : '#f3f4f6'),
                                        color: user.identity_type === '管理员' ? '#dc2626' : (user.identity_type === '志愿者' ? '#4f46e5' : '#4b5563')
                                    }}>
                                        {user.identity_type}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-btns">
                                        <button className="btn-approve" onClick={() => handleEditClick(user)} disabled={user.identity_type === '管理员'} style={{background: user.identity_type === '管理员' ? '#9ca3af' : '#3b82f6', color: 'white', cursor: user.identity_type === '管理员' ? 'not-allowed' : 'pointer'}}>编辑</button>
                                        <button className="btn-reject" onClick={() => handleDeleteClick(user.user_id, user.name)} disabled={user.identity_type === '管理员'} style={{cursor: user.identity_type === '管理员' ? 'not-allowed' : 'pointer'}}>删除</button>
                                    </div>
                                </td>
                            </tr>
                        ));
                    })()}
                </tbody>
            </table>

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel animate-fade-in" style={{
                        width: '400px', background: 'white', padding: '25px', borderRadius: '12px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px' }}>编辑用户信息</h2>
                            <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label>姓名</label>
                                <input required type="text" style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                    value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} />
                            </div>
                            <div>
                                <label>联系电话</label>
                                <input required type="text" style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                    value={editingUser.contact} onChange={e => setEditingUser({ ...editingUser, contact: e.target.value })} />
                            </div>
                            <div>
                                <label>密码</label>
                                <input type="text" style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                    value={editingUser.password || ''} placeholder="留空则不修改密码" onChange={e => setEditingUser({ ...editingUser, password: e.target.value })} />
                            </div>
                            <div>
                                <label>身份类型</label>
                                <select style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                    value={editingUser.identity_type || ''} onChange={e => setEditingUser({ ...editingUser, identity_type: e.target.value })}>
                                    <option value="农户">农户</option>
                                    <option value="志愿者">志愿者</option>
                                    <option value="管理员">管理员</option>
                                </select>
                            </div>

                            <button type="submit" style={{ padding: '12px', background: 'var(--primary-color, #3b82f6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, marginTop: '10px', cursor: 'pointer' }}>
                                保存修改
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
