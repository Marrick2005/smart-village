import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function DashboardStats() {
    const [stats, setStats] = useState({
        active_users: 0,
        video_completion_rate: 0,
        pending_approvals: 0,
        activity_trend: []
    });
    const [wordCloudData, setWordCloudData] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                
                const statsRes = await axios.get(`${API_BASE_URL}/analytics/dashboard-stats`, { headers });
                setStats(statsRes.data);

                const cloudRes = await axios.get(`${API_BASE_URL}/analytics/word-cloud`, { headers });
                setWordCloudData(cloudRes.data.data || []);
            } catch (error) {
                console.error("加载面板数据失败", error);
            }
        };
        fetchDashboardData();
    }, []);

    const getLineChartOption = () => ({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
        yAxis: { type: 'value' },
        series: [
            {
                data: stats.activity_trend.length ? stats.activity_trend : [820, 932, 901, 934, 1290, 1330, 1320],
                type: 'line',
                smooth: true,
                areaStyle: {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(58,77,233,0.8)' },
                            { offset: 1, color: 'rgba(58,77,233,0.3)' }
                        ]
                    }
                },
                itemStyle: { color: '#3a4de9' }
            }
        ]
    });

    const getBarChartOption = () => {
        const names = wordCloudData.map(item => item.name);
        const values = wordCloudData.map(item => item.value);
        return {
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            xAxis: { type: 'category', data: names.length ? names : ['黑腐病'], axisLabel: { interval: 0, rotate: 30 } },
            yAxis: { type: 'value' },
            series: [{
                data: values.length ? values : [100],
                type: 'bar',
                itemStyle: { color: '#67c23a', borderRadius: [5, 5, 0, 0] }
            }]
        };
    };

    return (
        <div className="dashboard-stats-container delay-100">
            <div className="stats-cards-grid">
                <div className="stat-card glass-panel">
                    <div className="stat-header">总用户活跃度</div>
                    <div className="stat-value">{stats.active_users.toLocaleString()}</div>
                    <div className="stat-desc">较昨日增加 <span className="text-success">+5.2%</span></div>
                </div>
                <div className="stat-card glass-panel">
                    <div className="stat-header">视频完课率</div>
                    <div className="stat-value">{stats.video_completion_rate}%</div>
                    <div className="stat-desc">较上周增加 <span className="text-success">+2.1%</span></div>
                </div>
                <div className="stat-card glass-panel">
                    <div className="stat-header">今日待审批用水申请</div>
                    <div className="stat-value text-warning">{stats.pending_approvals}</div>
                    <div className="stat-desc">请及时处理</div>
                </div>
            </div>

            <div className="charts-grid mt-20">
                <div className="chart-card glass-panel">
                    <div className="chart-header">农业需求热点分析</div>
                    <ReactECharts option={getBarChartOption()} style={{ height: '300px' }} />
                </div>
                <div className="chart-card glass-panel">
                    <div className="chart-header">系统使用活跃度趋势</div>
                    <ReactECharts option={getLineChartOption()} style={{ height: '300px' }} />
                </div>
            </div>
            <style>{`
                .stats-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                .stat-card { padding: 20px; border-radius: 12px; }
                .stat-header { font-size: 14px; color: var(--text-secondary); margin-bottom: 10px; }
                .stat-value { font-size: 32px; font-weight: bold; color: var(--text-primary); margin-bottom: 10px; }
                .stat-desc { font-size: 13px; color: var(--text-secondary); }
                .text-success { color: #10B981; font-weight: 500; }
                .text-warning { color: #F59E0B; font-weight: 500; }
                .charts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
                .chart-card { padding: 20px; border-radius: 12px; }
                .chart-header { font-weight: 600; margin-bottom: 15px; }
                .mt-20 { margin-top: 20px; }
            `}</style>
        </div>
    );
}
