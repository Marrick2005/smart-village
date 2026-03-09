import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Check, X, MapPin, AudioLines, Plus, Trash2, Edit2, Save, Search } from 'lucide-react';
import '../Home.css';
import './CultureManagement.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function CultureManagement() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('stories'); // 'stories' or 'landmarks'
    const [pendingStories, setPendingStories] = useState([]);
    const [landmarks, setLandmarks] = useState([]);
    const [loading, setLoading] = useState(false);

    // Landmark Form
    const [showLmModal, setShowLmModal] = useState(false);
    const [editingLm, setEditingLm] = useState(null);
    const [lmForm, setLmForm] = useState({ title: '', description: '', latitude: 36.5755, longitude: 113.8820 });
    const [mapPicker, setMapPicker] = useState(null);
    const [markerPicker, setMarkerPicker] = useState(null);

    // Review Modal
    const [reviewingStory, setReviewingStory] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchStories();
        fetchLandmarks();
    }, []);

    const fetchStories = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/culture/pending-stories`);
            setPendingStories(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchLandmarks = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/culture/landmarks`);
            setLandmarks(res.data);
        } catch (err) { console.error(err); }
    };

    // --- Story Audit ---
    const handleReview = async (storyId, status, reason = '') => {
        try {
            await axios.post(`${API_BASE_URL}/admin/culture/review-story`, {
                story_id: storyId,
                status: status,
                reject_reason: reason
            });
            setReviewingStory(null);
            setRejectReason('');
            fetchStories();
        } catch (err) { alert('审核提交失败'); }
    };

    // Ensure AMap is loaded
    useEffect(() => {
        const loadAmap = async () => {
            if (!window.AMap && !document.getElementById('amap-script')) {
                try {
                    const configRes = await axios.get(`${API_BASE_URL}/config`);
                    const { amap_key, amap_security_code } = configRes.data;

                    window._AMapSecurityConfig = {
                        securityJsCode: amap_security_code,
                    };
                    const script = document.createElement('script');
                    script.id = 'amap-script';
                    script.src = `https://webapi.amap.com/maps?v=2.0&key=${amap_key}&plugin=AMap.PlaceSearch,AMap.AutoComplete`;
                    script.async = true;
                    document.head.appendChild(script);
                } catch (error) {
                    console.error("Failed to load Amap config:", error);
                }
            }
        };
        loadAmap();
    }, []);

    // --- Landmark Map Picker Logic ---
    useEffect(() => {
        let localMap = null;

        if (showLmModal) {
            const initializeMap = () => {
                if (!window.AMap || !document.getElementById('admin-map-picker')) return;

                localMap = new window.AMap.Map('admin-map-picker', {
                    zoom: 13,
                    center: [lmForm.longitude, lmForm.latitude]
                });

                const marker = new window.AMap.Marker({
                    position: [lmForm.longitude, lmForm.latitude],
                    draggable: true
                });
                marker.setMap(localMap);

                localMap.on('click', (e) => {
                    const { lng, lat } = e.lnglat;
                    marker.setPosition([lng, lat]);
                    setLmForm(prev => ({ ...prev, longitude: lng, latitude: lat }));
                });

                marker.on('dragend', (e) => {
                    const { lng, lat } = e.lnglat;
                    setLmForm(prev => ({ ...prev, longitude: lng, latitude: lat }));
                });

                // Initialize Search Plugins
                window.AMap.plugin(['AMap.PlaceSearch', 'AMap.AutoComplete'], function () {
                    const auto = new window.AMap.AutoComplete({
                        input: "amap-search-input"
                    });

                    const placeSearch = new window.AMap.PlaceSearch();

                    const handleSearch = (keyword) => {
                        if (!keyword) return;
                        placeSearch.search(keyword, function (status, result) {
                            if (status === 'complete' && result.info === 'OK') {
                                const poiList = result.poiList?.pois;
                                if (poiList && poiList.length > 0) {
                                    const poi = poiList[0];
                                    const lng = poi.location.lng;
                                    const lat = poi.location.lat;

                                    localMap.setZoomAndCenter(15, [lng, lat]);
                                    marker.setPosition([lng, lat]);
                                    setLmForm(prev => ({ ...prev, longitude: lng, latitude: lat }));
                                }
                            } else {
                                alert('未找到相关地点信息，请尝试更换关键词');
                            }
                        });
                    };

                    const searchBtn = document.getElementById('map-search-icon-btn');
                    if (searchBtn) {
                        searchBtn.onclick = () => {
                            const val = document.getElementById('amap-search-input').value;
                            handleSearch(val);
                        };
                    }

                    auto.on("select", function (e) {
                        placeSearch.setCity(e.poi.adcode);
                        handleSearch(e.poi.name);
                    });
                });

                setMapPicker(localMap);
                setMarkerPicker(marker);
            };

            if (window.AMap) {
                setTimeout(initializeMap, 100); // Wait for modal enter animation
            } else {
                const script = document.getElementById('amap-script');
                if (script) {
                    script.addEventListener('load', () => setTimeout(initializeMap, 100));
                }
            }
        }

        return () => {
            if (localMap) {
                localMap.destroy();
                setMapPicker(null);
                setMarkerPicker(null);
            }
        };
    }, [showLmModal]);

    const saveLandmark = async () => {
        try {
            if (editingLm) {
                await axios.put(`${API_BASE_URL}/admin/culture/landmarks/${editingLm.landmark_id}`, lmForm);
            } else {
                await axios.post(`${API_BASE_URL}/admin/culture/landmarks`, lmForm);
            }
            setShowLmModal(false);
            setEditingLm(null);
            setLmForm({ title: '', description: '', latitude: 36.5755, longitude: 113.8820 });
            fetchLandmarks();
        } catch (err) { alert('保存失败'); }
    };

    const deleteLandmark = async (id) => {
        if (!window.confirm('确定要删除这个景点吗？')) return;
        try {
            await axios.delete(`${API_BASE_URL}/admin/culture/landmarks/${id}`);
            fetchLandmarks();
        } catch (err) { alert('删除失败'); }
    };

    return (
        <div className="home-container animate-fade-in">
            <nav className="navbar glass-panel">
                <div className="nav-brand gradient-text" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin')}>← 返回管理后台</div>
                <div className="admin-tabs">
                    <button className={activeTab === 'stories' ? 'active' : ''} onClick={() => setActiveTab('stories')}>
                        <AudioLines size={18} /> 故事审核 ({pendingStories.length})
                    </button>
                    <button className={activeTab === 'landmarks' ? 'active' : ''} onClick={() => setActiveTab('landmarks')}>
                        <MapPin size={18} /> 景点管理
                    </button>
                </div>
            </nav>

            <main className="dashboard-content">
                {activeTab === 'stories' ? (
                    <div className="admin-section animate-slide-up">
                        <header className="section-header">
                            <div>
                                <h2>🎙️ 待审核音频故事</h2>
                                <p>请仔细核对农户上传的乡村记忆，确保内容积极向上</p>
                            </div>
                        </header>

                        <div className="story-list">
                            {pendingStories.length === 0 ? (
                                <div className="empty-state">目前没有待处理的审核任务</div>
                            ) : (
                                pendingStories.map(story => (
                                    <div key={story.story_id} className="story-card admin-card glass-panel">
                                        <div className="story-info">
                                            <h4>{story.title}</h4>
                                            <span className="story-tag">{story.tags}</span>
                                            <p className="story-meta">上传时间: {new Date(story.upload_time).toLocaleString()}</p>
                                        </div>
                                        <div className="story-audio">
                                            <audio controls src={`http://127.0.0.1:8000${story.audio_url}`} />
                                        </div>
                                        <div className="story-actions">
                                            <button className="btn-approve" onClick={() => handleReview(story.story_id, 1)}>
                                                <Check size={18} /> 通过发布
                                            </button>
                                            <button className="btn-reject" onClick={() => setReviewingStory(story)}>
                                                <X size={18} /> 驳回申请
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="admin-section animate-slide-up">
                        <header className="section-header">
                            <div>
                                <h2>📍 文化地标管理</h2>
                                <p>管理地图上的红色文化景点信息</p>
                            </div>
                            <button className="btn-primary" onClick={() => { setEditingLm(null); setLmForm({ title: '', description: '', latitude: 36.5755, longitude: 113.8820 }); setShowLmModal(true); }}>
                                <Plus size={18} /> 添加新景点
                            </button>
                        </header>

                        <div className="landmarks-grid">
                            {landmarks.map(lm => (
                                <div key={lm.landmark_id} className="landmark-admin-card glass-panel">
                                    <div className="lm-header">
                                        <h4>{lm.title}</h4>
                                        <div className="lm-tools">
                                            <Edit2 size={16} onClick={() => { setEditingLm(lm); setLmForm(lm); setShowLmModal(true); }} />
                                            <Trash2 size={16} onClick={() => deleteLandmark(lm.landmark_id)} />
                                        </div>
                                    </div>
                                    <p className="lm-desc">{lm.description}</p>
                                    <div className="lm-coords">
                                        <span>纬度: {Number(lm.latitude).toFixed(4)}</span>
                                        <span>经度: {Number(lm.longitude).toFixed(4)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Reject Reason Modal */}
            {reviewingStory && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel animate-scale-in">
                        <h3>阐明拒绝理由</h3>
                        <textarea
                            placeholder="请填写具体的原因，以便农户修改后重新上传..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="modal-actions">
                            <button onClick={() => setReviewingStory(null)}>取消</button>
                            <button className="btn-danger" onClick={() => handleReview(reviewingStory.story_id, 2, rejectReason)}>确认驳回</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Landmark Modal */}
            {showLmModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel lm-modal animate-scale-in">
                        <h3>{editingLm ? '编辑地标' : '添加新文化地标'}</h3>
                        <div className="lm-form-layout">
                            <div className="form-inputs">
                                <div className="input-group">
                                    <label>景点名称</label>
                                    <input value={lmForm.title} onChange={e => setLmForm({ ...lmForm, title: e.target.value })} placeholder="输入景点标题" />
                                </div>
                                <div className="input-group">
                                    <label>文字介绍</label>
                                    <textarea value={lmForm.description} onChange={e => setLmForm({ ...lmForm, description: e.target.value })} placeholder="输入景点背景介绍..." />
                                </div>
                                <div className="coords-display">
                                    <span>Lgn: {Number(lmForm.longitude).toFixed(6)}</span>
                                    <span>Lat: {Number(lmForm.latitude).toFixed(6)}</span>
                                </div>
                                <p className="hint">提示：在右侧地图上点击或拖动大头针可精确定位坐标</p>
                            </div>
                            <div className="map-section">
                                <div className="map-search-container">
                                    <input
                                        id="amap-search-input"
                                        className="map-search-input"
                                        placeholder="输入地点关键词快速搜索地图..."
                                    />
                                    <Search id="map-search-icon-btn" className="map-search-icon" size={20} />
                                </div>
                                <div id="admin-map-picker" className="map-picker-container"></div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setShowLmModal(false)}>取消</button>
                            <button className="btn-primary" onClick={saveLandmark}><Save size={18} /> 保存景点</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
