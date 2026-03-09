import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AMapLoader from '@amap/amap-jsapi-loader';
import UploadModal from '../../components/UploadModal';
import '../Home.css';
import { MapPin, MessageSquare, Send, Camera, Image } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function GuestHome() {
    const navigate = useNavigate();
    const mapRef = useRef(null);
    const isMapLoading = useRef(false);
    const [mapInstance, setMapInstance] = useState(null);
    const [landmarks, setLandmarks] = useState([]);

    // Modal & Audio Control
    const [selectedLandmark, setSelectedLandmark] = useState(null);
    const [landmarkStories, setLandmarkStories] = useState([]);
    const [loadingStories, setLoadingStories] = useState(false);

    // Feedback State
    const [feedbackContent, setFeedbackContent] = useState('');
    const [feedbackImage, setFeedbackImage] = useState('');
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        // Authenticate guest
        const userStr = localStorage.getItem('user');
        if (!userStr || JSON.parse(userStr).identity_type !== '游客') {
            navigate('/login');
            return;
        }

        // Initialize Map
        const initMap = async () => {
            if (isMapLoading.current) return;
            isMapLoading.current = true;
            try {
                // Fetch Amap configuration from backend
                const configRes = await axios.get(`${API_BASE_URL}/config`);
                const { amap_key, amap_security_code } = configRes.data;

                // Initialize Amap JS API
                window._AMapSecurityConfig = {
                    securityJsCode: amap_security_code,
                };

                const AMap = await AMapLoader.load({
                    key: amap_key, // Replaced demo key with dynamic key from backend
                    version: '2.0',
                    plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.ControlBar'],
                });

                const map = new AMap.Map(mapRef.current, {
                    viewMode: '3D',
                    zoom: 12,
                    center: [113.7667, 36.5667], // Default Handan, Shexian roughly.
                    mapStyle: 'amap://styles/normal' // can be fresh/dark/blue etc
                });

                map.addControl(new AMap.Scale());
                map.addControl(new AMap.ToolBar());

                setMapInstance(map);

                // Fetch Landmarks
                const res = await axios.get(`${API_BASE_URL}/culture/red-landmarks`);
                const marks = res.data.landmarks || [];
                setLandmarks(marks);

                // Render Markers
                if (marks.length > 0) {
                    const markers = marks.map((lm) => {
                        const marker = new AMap.Marker({
                            position: [lm.longitude, lm.latitude],
                            title: lm.title,
                            icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
                            label: {
                                content: `<div style="padding: 4px 8px; border-radius: 4px; background: rgba(255,255,255,0.9); box-shadow: 0 2px 6px rgba(0,0,0,0.1); font-size: 12px; font-weight: 500; color: #1e293b;">${lm.title}</div>`,
                                offset: new AMap.Pixel(0, 15),
                                direction: 'bottom'
                            }
                        });

                        marker.on('click', () => {
                            openLandmarkModal(lm);
                        });
                        return marker;
                    });
                    map.add(markers);
                    map.setFitView(markers); // center map onto all loaded markers intelligently
                }
            } catch (err) {
                console.error('Map loading error', err);
                isMapLoading.current = false;
            }
        };

        if (!mapInstance && !isMapLoading.current) {
            initMap();
        }

        return () => {
            // Cleanup map instance if needed on unmount
            if (mapInstance && typeof mapInstance.destroy === 'function') {
                mapInstance.destroy();
            }
        };
    }, [navigate, mapInstance]);

    const openLandmarkModal = async (landmark) => {
        setSelectedLandmark(landmark);
        setLoadingStories(true);
        setLandmarkStories([]);
        try {
            const res = await axios.get(`${API_BASE_URL}/culture/red-landmarks/${landmark.landmark_id}/stories`);
            setLandmarkStories(res.data || []);
        } catch (err) {
            console.error('Failed to load stories for landmark:', err);
        } finally {
            setLoadingStories(false);
        }
    };

    const submitFeedback = async (e) => {
        e.preventDefault();
        if (!feedbackContent.trim()) return;
        setSubmittingFeedback(true);

        try {
            await axios.post(`${API_BASE_URL}/guest/feedback`, {
                content: feedbackContent,
                image_url: feedbackImage || null
            });
            alert('反馈提交成功，感谢您的建议！');
            setFeedbackContent('');
            setFeedbackImage('');
        } catch (err) {
            console.error('Feedback submit failed', err);
            alert('提交失败，请检查网络');
        } finally {
            setSubmittingFeedback(false);
        }
    };

    return (
        <div className="home-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <nav className="navbar glass-panel" style={{ zIndex: 100 }}>
                <div className="nav-brand gradient-text">🌐 涉县全域数字地图 (游客专区)</div>
                <div className="nav-user">
                    <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="logout-btn">退出游客模式</button>
                </div>
            </nav>

            <main style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
                {/* Amap Canvas container */}
                <div
                    ref={mapRef}
                    style={{ flex: 1, height: '100%', minHeight: 'calc(100vh - 72px)', position: 'relative', borderRight: '1px solid #e2e8f0' }}
                />

                {/* Right Panel: Feedback */}
                <div className="glass-panel" style={{ width: '400px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                        <MessageSquare color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>意见与建议箱</h3>
                    </div>

                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                        感谢您游览美丽的涉县。如果您在旅途中有任何感受、投诉、或关于平台优化的建议，请告诉我们。(支持匿名下发至管理端)
                    </p>

                    <form onSubmit={submitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
                        <textarea
                            required
                            placeholder="写下您的建议或发现的问题..."
                            value={feedbackContent}
                            onChange={(e) => setFeedbackContent(e.target.value)}
                            style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', flex: 1, resize: 'none' }}
                        />

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>
                                <Camera size={16} /> <span>附加照片 (选项)</span>
                            </div>
                            {feedbackImage ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc' }}>
                                    <Image size={18} color="var(--primary)" />
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px', color: '#334155' }}>
                                        已上传: 继续附加将替换
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowUploadModal(true)}
                                        style={{ padding: '4px 8px', fontSize: '12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                                    >更换</button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(true)}
                                    style={{ width: '100%', padding: '10px', border: '1px dashed #cbd5e1', borderRadius: '8px', background: 'transparent', color: '#64748b', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                                >
                                    <Camera size={18} /> 点击上传图片
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={submittingFeedback}
                            style={{
                                padding: '12px', background: 'var(--primary)', color: 'white', border: 'none',
                                borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                cursor: submittingFeedback ? 'not-allowed' : 'pointer', opacity: submittingFeedback ? 0.7 : 1
                            }}
                        >
                            <Send size={18} /> {submittingFeedback ? '提交中...' : '提交反馈'}
                        </button>
                    </form>
                </div>

                {/* Optional: Landmark Modal */}
                {selectedLandmark && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <div className="glass-panel animate-fade-in" style={{
                            width: '500px', maxHeight: '80vh', overflowY: 'auto', background: 'white', padding: '30px', borderRadius: '16px', position: 'relative'
                        }}>
                            <button onClick={() => setSelectedLandmark(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>×</button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                <MapPin color="#e11d48" />
                                <h2 style={{ margin: 0, color: '#1e293b' }}>{selectedLandmark.title}</h2>
                            </div>

                            <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '25px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                                {selectedLandmark.description || "该地标暂无详细图文介绍。"}
                            </p>

                            <h3 style={{ fontSize: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>🎧 乡音讲述 (农户故事)</h3>

                            {loadingStories ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>加载音频数据中...</div>
                            ) : landmarkStories.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>暂无通过审核的农户音频故事。</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {landmarkStories.map(story => (
                                        <div key={story.story_id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', background: '#fff' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <strong style={{ color: '#0f172a' }}>{story.title}</strong>
                                                <span style={{ color: '#0ea5e9', fontSize: '13px', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '20px', background: '#f0f9ff' }}>{story.tags}</span>
                                            </div>
                                            <audio controls style={{ width: '100%', height: '40px' }} controlsList="nodownload">
                                                <source src={API_BASE_URL.replace('/api', '') + story.audio_url} />
                                                您的浏览器不支持 HTML5 audio 标签。
                                            </audio>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px', textAlign: 'right' }}>
                                                上传时间: {new Date(story.upload_time).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <UploadModal 
                isOpen={showUploadModal} 
                onClose={() => setShowUploadModal(false)}
                onUploadSuccess={(url) => setFeedbackImage(url)}
                accept="image/*"
                title="上传反馈图片"
                uploadUrl="/upload" 
            />
        </div>
    );
}
