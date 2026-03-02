-- 插入测试用户
INSERT INTO users (name, township, identity_type) VALUES ('王大锤', '西戌镇', '农户');
INSERT INTO users (name, township, identity_type) VALUES ('李秀兰', '更乐镇', '农户');

-- 插入测试视频
INSERT INTO videos (video_topic, video_type, video_duration) VALUES ('职场沟通技巧', '职场普通话', 300);
INSERT INTO videos (video_topic, video_type, video_duration) VALUES ('如何预防养老诈骗', '老年防诈', 450);

-- 插入观看记录 (假设 user_id=1 看了 video_id=1, user_id=2 看了 video_id=2)
INSERT INTO video_watch_records (video_id, user_id, click_time, actual_watch_duration, is_finished) 
VALUES (1, 1, '2026-03-02 10:00:00', 300, 1);
INSERT INTO video_watch_records (video_id, user_id, click_time, actual_watch_duration, is_finished) 
VALUES (2, 2, '2026-03-02 15:30:00', 120, 0);

