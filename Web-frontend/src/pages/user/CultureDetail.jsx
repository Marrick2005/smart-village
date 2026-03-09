import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UploadModal from '../../components/UploadModal';
import '../Home.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function CultureDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [landmark, setLandmark] = useState(null);
    const [loading, setLoading] = useState(true);

    // Recording States
    const [isRecording, setIsRecording] = useState(false);
    const [recorder, setRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [recordingTime, setRecordingTime] = useState(0);
    const [showOptions, setShowOptions] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Stories States
    const [stories, setStories] = useState([]);

    useEffect(() => {
        const fetchLandmarkAndStories = async () => {
            setLoading(true);
            try {
                // Fetch landmark details
                const lmRes = await axios.get(`${API_BASE_URL}/culture/red-landmarks/${id}`);
                setLandmark(lmRes.data);

                // Fetch approved stories for this landmark
                const stRes = await axios.get(`${API_BASE_URL}/culture/red-landmarks/${id}/stories`);
                setStories(stRes.data || []);
            } catch (err) {
                console.error('获取地标或故事失败', err);
                // Optionally handle 404
            } finally {
                setLoading(false);
            }
        };
        fetchLandmarkAndStories();
    }, [id]);

    // Timer for recording
    useEffect(() => {
        let interval = null;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRecording]);

    // Removed handleFileChange because UploadModal directly calls confirmUpload with file

    const startRecording = async () => {
        if (!navigator.mediaDevices || !window.MediaRecorder) {
            alert('您的浏览器不支持录音功能，请尝试上传文件或更换浏览器');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const chunks = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                if (chunks.length === 0) return;
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                const recordedFile = new File([audioBlob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
                confirmUpload(recordedFile);
                setRecordingTime(0);

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => {
                    try { track.stop(); } catch (e) { }
                });
            };

            mediaRecorder.start();
            setRecorder(mediaRecorder);
            setIsRecording(true);
            setRecordingTime(0);
        } catch (err) {
            console.error('无法开启麦克风', err);
            alert('无法访问麦克风，请检查是否已授权，并确保使用 https 或 localhost 访问');
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (recorder && isRecording) {
            recorder.stop();
            setIsRecording(false);
        }
    };

    const confirmUpload = async (selectedFile) => {
        if (!selectedFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('audio', selectedFile);
        formData.append('title', `【${landmark?.title || '未知地点'}】的乡村记忆`);
        formData.append('tags', '方言故事');
        formData.append('landmark_id', id);

        try {
            const res = await axios.post(`${API_BASE_URL}/culture/upload-story`, formData);
            alert(res.data.message);
            setShowOptions(false);
        } catch (err) {
            console.error(err);
            alert('上传音频失败，上传速度可能较慢，请稍后再试或检查文件大小');
        } finally {
            setUploading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="home-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!landmark) {
        return (
            <div className="home-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <h2>未找到该景点信息</h2>
                <button onClick={() => navigate('/culture')} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>返回文化融合页</button>
            </div>
        );
    }

    return (
        <div className="home-container animate-fade-in" style={{ paddingBottom: '50px' }}>
            <nav className="navbar glass-panel">
                <div className="nav-brand gradient-text" style={{ cursor: 'pointer' }} onClick={() => navigate('/culture')}>← 返回文化足迹</div>
            </nav>

            <main className="dashboard-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <header className="dashboard-header" style={{ textAlign: 'left', marginBottom: '20px' }}>
                    <h2 style={{ color: '#F59E0B', marginTop: 0 }}>📍 {landmark.title}</h2>
                    <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{landmark.description || '暂无详细介绍'}</p>
                </header>

                <div className="module-card glass-panel delay-100" style={{ textAlign: 'left', cursor: 'default', border: isRecording ? '2px solid #ef4444' : 'none', marginBottom: '30px' }}>
                    <h3 style={{ marginTop: 0 }}>🎙️ 为这里留下你的声音</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
                        传承在此发生的革命故事，或讲述这里的乡村巨变。您的声音将成为涉县数字大脑珍贵的文化记忆！
                    </p>

                    {!showOptions && !isRecording && !uploading && (
                        <button
                            onClick={() => setShowOptions(true)}
                            style={{
                                width: '100%', padding: '14px', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: 'white',
                                border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                                transition: 'all 0.2s'
                            }}>
                            🚀 立即讲述发生在这里的故事
                        </button>
                    )}

                    {showOptions && !isRecording && !uploading && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} className="animate-fade-in">
                            <button
                                onClick={startRecording}
                                style={{
                                    width: '100%', padding: '12px', background: '#FEE2E2', color: '#DC2626',
                                    border: '1px solid #FECACA', borderRadius: '10px', cursor: 'pointer', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}>
                                <span>🔴</span> 立即在线录音
                            </button>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                style={{
                                    width: '100%', padding: '12px', background: '#FEF3C7', color: '#B45309',
                                    border: '1px solid #FDE68A', borderRadius: '10px', cursor: 'pointer', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}>
                                <span>📁</span> 上传本地文件
                            </button>
                            <button
                                onClick={() => setShowOptions(false)}
                                style={{
                                    width: '100%', padding: '10px', background: 'transparent', color: '#64748b',
                                    border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px'
                                }}>
                                返回
                            </button>
                        </div>
                    )}

                    {isRecording && (
                        <div style={{ textAlign: 'center', padding: '10px' }} className="animate-pulse">
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#DC2626', marginBottom: '10px' }}>
                                ● {formatTime(recordingTime)}
                            </div>
                            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>正在录音中，请对着麦克风说话...</p>
                            <button
                                onClick={stopRecording}
                                style={{
                                    width: '100%', padding: '12px', background: '#DC2626', color: 'white',
                                    border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600
                                }}>
                                停止录音并上传
                            </button>
                        </div>
                    )}

                    {uploading && (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto 15px auto' }}></div>
                            <p style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 500 }}>音频故事正在飞速上传中...</p>
                            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>请勿刷新页面</p>
                        </div>
                    )}

                    <UploadModal 
                        isOpen={showUploadModal} 
                        onClose={() => setShowUploadModal(false)}
                        onUploadSuccess={confirmUpload}
                        accept="audio/*,video/*"
                        title="上传本地音频"
                        uploadUrl="" 
                    />
                </div>

                {/* Approved Stories Section */}
                <div className="module-card glass-panel delay-200" style={{ textAlign: 'left', cursor: 'default' }}>
                    <h3 style={{ marginTop: 0 }}>🎧 大家在这里留下的声音</h3>
                    <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {stories.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '14px' }}>
                                这里还没有人留下故事，快来抢占第一声吧！
                            </div>
                        ) : (
                            stories.map(s => (
                                <div key={s.story_id} style={{
                                    padding: '15px',
                                    background: 'rgba(255,255,255,0.6)',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex', flexDirection: 'column', gap: '10px'
                                }}>
                                    <h4 style={{ margin: 0, color: '#334155' }}>{s.title}</h4>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                        发布于：{new Date(s.upload_time).toLocaleString()}
                                    </div>
                                    <audio controls src={`http://127.0.0.1:8000${s.audio_url}`} style={{ width: '100%', height: '36px', outline: 'none' }}>
                                        您的浏览器不支持 audio 标签。
                                    </audio>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
