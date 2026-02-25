from fastapi import APIRouter
import jieba

router = APIRouter()

@router.get("/dashboard-stats")
def get_dashboard_stats():
    """提供数据赋能大屏需要的数据指标"""
    return {
        "active_users": 12504,
        "video_completion_rate": 76.3,
        "pending_approvals": 14,
        "activity_trend": [820, 932, 901, 934, 1290, 1330, 1320]
    }

@router.get("/word-cloud")
def get_word_cloud():
    """
    读取所有的提问与搜索历史，进行 jieba 分词后返回词频
    """
    # 数据检索
    search_texts = [
        "核桃树得了黑腐病怎么办？",
        "今年天气干旱，什么时候灌溉合适？",
        "花椒树上的蚜虫怎么治",
        "黑腐病的特效药推荐",
        "连续干旱，玉米苗缺水"
    ]
    
    # 将文本合并
    full_text = " ".join(search_texts)
    
    # 使用 jieba 进行分词
    words = jieba.lcut(full_text)
    
    # 统计词频
    stop_words = ["的", "了", "怎么办", "怎么", "什么时候", "推荐", "今年", "合适", "上", "治"]
    word_freq = {}
    for word in words:
        if len(word) > 1 and word not in stop_words:
            word_freq[word] = word_freq.get(word, 0) + 1
            
    # 结构化为Echarts可读数据格式
    sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    return {
        "data": [{"name": k, "value": v * 10} for k, v in sorted_words]  # *10 放大效果
    }
