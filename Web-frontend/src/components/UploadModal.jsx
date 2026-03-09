import { useState } from 'react';
import axios from 'axios';
import { Upload, X, Loader2 } from 'lucide-react';
import '../pages/Home.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function UploadModal({ 
    isOpen, 
    onClose, 
    onUploadSuccess, 
    accept = "*/*", 
    title = "上传文件",
    uploadUrl = "/upload",
    fileFieldName = "file",
    extraData = {}
}) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        
        // Custom submit logic (parent handles the file)
        if (typeof onUploadSuccess === 'function' && !uploadUrl) {
           await onUploadSuccess(file);
           setUploading(false);
           setFile(null);
           onClose();
           return;
        }

        const formData = new FormData();
        formData.append(fileFieldName, file);
        
        Object.keys(extraData).forEach(key => {
            formData.append(key, extraData[key]);
        });

        try {
            const res = await axios.post(`${API_BASE_URL}${uploadUrl}`, formData);
            if (res.data) {
                alert(res.data.message || '上传成功！');
                onUploadSuccess(res.data.url || res.data);
                setFile(null);
                onClose();
            } else {
                alert('上传失败，未获取到响应数据');
            }
        } catch (err) {
            console.error('上传出错', err);
            alert('上传失败，请稍后重试');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div className="modal-content glass-panel animate-scale-in" style={{
                background: 'white', width: '400px', maxWidth: '90%',
                borderRadius: '16px', padding: '24px', position: 'relative'
            }}>
                <button 
                    onClick={onClose} 
                    disabled={uploading}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'none', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', color: '#64748b'
                    }}
                >
                    <X size={20} />
                </button>

                <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Upload size={20} color="var(--primary)" />
                    {title}
                </h3>

                <div style={{
                    border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '30px',
                    textAlign: 'center', backgroundColor: '#f8fafc', marginBottom: '20px'
                }}>
                    <input
                        type="file"
                        id="modal-file-upload"
                        accept={accept}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        disabled={uploading}
                    />
                    <label htmlFor="modal-file-upload" style={{ cursor: uploading ? 'not-allowed' : 'pointer', display: 'block' }}>
                        {file ? (
                            <div style={{ color: 'var(--primary)', fontWeight: 500, wordBreak: 'break-all' }}>
                                选取的文件：<br/>{file.name}
                            </div>
                        ) : (
                            <div style={{ color: '#64748b' }}>
                                点击此处选择文件
                            </div>
                        )}
                    </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button 
                        onClick={onClose} 
                        disabled={uploading}
                        style={{
                            padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1',
                            background: 'white', color: '#64748b', cursor: uploading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        style={{
                            padding: '10px 16px', borderRadius: '8px', border: 'none',
                            background: (!file || uploading) ? '#94a3b8' : 'var(--primary)', 
                            color: 'white', cursor: (!file || uploading) ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        {uploading ? <Loader2 size={16} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} /> : null}
                        {uploading ? '上传中...' : '确认上传'}
                    </button>
                </div>
            </div>
        </div>
    );
}
