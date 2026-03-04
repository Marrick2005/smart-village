-- --------------------------------------------------------
-- 主机:                           127.0.0.1
-- 服务器版本:                        8.0.44 - MySQL Community Server - GPL
-- 服务器操作系统:                      Win64
-- HeidiSQL 版本:                  12.13.0.7147
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- 正在导出表  smart_village_db.activity_expenses 的数据：~4 rows (大约)
INSERT INTO `activity_expenses` (`expense_id`, `activity_id`, `expense_type`, `amount`, `remark`) VALUES
	(1, 1, '材料费', 500.00, '购买修剪剪刀、手套等工具'),
	(2, 1, '交通费', 200.00, '志愿者往返包车费用'),
	(3, 1, '其他', 500.00, '志愿者午餐及饮水'),
	(4, 2, '宣传费', 300.00, '印制防诈骗手册200份');

-- 正在导出表  smart_village_db.activity_participations 的数据：~4 rows (大约)
INSERT INTO `activity_participations` (`participation_id`, `activity_id`, `user_id`, `role`, `participation_duration`) VALUES
	(1, 1, 6, '技术指导', 8.0),
	(2, 1, 7, '后勤保障', 8.0),
	(3, 2, 6, '宣传单派发', 2.0),
	(4, 2, 4, '听众代表', 2.0);

-- 正在导出表  smart_village_db.dialect_stories 的数据：~5 rows (大约)
INSERT INTO `dialect_stories` (`story_id`, `title`, `tags`, `audio_url`, `user_id`, `upload_time`, `status`, `landmark_id`, `reject_reason`) VALUES
	(1, '爷爷讲的青山镇老龙潭传说', '民间故事, 绿水方言', 'https://oss.example.com/story_dragon.mp3', 3, '2024-03-20 09:00:00', 1, NULL, NULL),
	(2, '麦收号子', '传统民歌', 'https://oss.example.com/story_song.mp3', 1, '2024-04-01 10:00:00', 0, NULL, NULL),
	(3, 'test', 'test', '/uploads/audios/8012_models.py', NULL, '2026-03-04 01:49:37', 0, 1, NULL),
	(4, '【八路军一二九师纪念馆】的乡村记忆', '方言故事', '/uploads/audios/5770_recording_1772560426935.webm', NULL, '2026-03-04 01:53:47', 1, 1, NULL),
	(5, '【八路军一二九师纪念馆】的乡村记忆', '方言故事', '/uploads/audios/2943_沙滩.wav', NULL, '2026-03-04 01:53:53', 1, 1, NULL);

-- 正在导出表  smart_village_db.farming_behavior_records 的数据：~4 rows (大约)
INSERT INTO `farming_behavior_records` (`record_id`, `user_id`, `record_time`, `township`, `click_count`, `farming_stage`, `is_adopted_advice`, `reminder_category`, `crop_type`) VALUES
	(1, 1, '2024-03-01 08:00:00', '青山镇', 3, '生长期', 1, '浇水', '核桃'),
	(2, 2, '2024-03-02 09:00:00', '青山镇', 2, '萌芽期', 1, '浇水', '花椒'),
	(3, 3, '2024-03-03 09:30:00', '绿水乡', 5, '萌芽期', 1, '防虫', '苹果'),
	(4, 4, '2024-03-04 07:00:00', '白云村', 1, '生长期', 1, '浇水', '蔬菜');

-- 正在导出表  smart_village_db.farming_issue_feedbacks 的数据：~3 rows (大约)
INSERT INTO `farming_issue_feedbacks` (`issue_id`, `user_id`, `township`, `submit_time`, `severity`, `issue_type`, `image_url`) VALUES
	(1, 1, '青山镇', '2024-03-10 14:00:00', '中等', '病害', 'https://oss.example.com/issue_walnut.jpg'),
	(2, 2, '青山镇', '2024-04-05 10:00:00', '紧急', '灌溉管道破损', 'https://oss.example.com/issue_pipe.jpg'),
	(3, 3, '绿水乡', '2024-04-10 15:30:00', '一般', '虫害', 'https://oss.example.com/issue_apple.jpg');

-- 正在导出表  smart_village_db.public_activities 的数据：~2 rows (大约)
INSERT INTO `public_activities` (`activity_id`, `activity_name`, `activity_type`, `start_time`, `end_time`, `village`, `activity_description`, `total_budget`) VALUES
	(1, '春季果园义务修剪助农活动', '农业服务', '2024-03-15 08:00:00', '2024-03-15 17:00:00', '青山村', '组织懂技术的志愿者帮助缺乏劳动力的果农修剪果树', 1200.00),
	(2, '反电诈及乡村振兴政策宣讲', '法制教育', '2024-04-10 14:00:00', '2024-04-10 16:00:00', '白云村', '村委组织的线下政策与防诈骗知识普及', 500.00);

-- 正在导出表  smart_village_db.red_landmarks 的数据：~2 rows (大约)
INSERT INTO `red_landmarks` (`landmark_id`, `title`, `description`, `latitude`, `longitude`, `create_time`, `image_url`) VALUES
	(1, '八路军一二九师纪念馆', '八路军一二九师纪念馆', 36.579335, 113.622227, '2026-03-04 01:16:48', NULL),
	(2, '西坡书院', '西坡书院', 36.578338, 113.848845, '2026-03-04 01:59:22', NULL);

-- 正在导出表  smart_village_db.school_checkins 的数据：~2 rows (大约)
INSERT INTO `school_checkins` (`checkin_id`, `user_id`, `image_url`, `checkin_time`, `status`) VALUES
	(1, 6, 'https://oss.example.com/checkin_xm_1.jpg', '2024-04-01 18:30:00', 1),
	(2, 7, 'https://oss.example.com/checkin_hm_1.jpg', '2024-04-02 19:00:00', 1);

-- 正在导出表  smart_village_db.users 的数据：~10 rows (大约)
INSERT INTO `users` (`user_id`, `name`, `gender`, `township`, `contact`, `identity_type`, `password`) VALUES
	(1, '张大壮', '男', '青山镇', '13800138001', '农户', 'YOUR_PASSWORD_HERE'),
	(2, '李秀兰', '女', '青山镇', '13800138002', '农户', 'YOUR_PASSWORD_HERE'),
	(3, '王老汉', '男', '绿水乡', '13800138003', '农户', 'YOUR_PASSWORD_HERE'),
	(4, '赵大娘', '女', '白云村', '13800138004', '农户', 'YOUR_PASSWORD_HERE'),
	(5, '刘强', '男', '绿水乡', '13800138005', '农户', 'YOUR_PASSWORD_HERE'),
	(6, '王小明', '男', '绿水乡', '13900139001', '志愿者', 'YOUR_PASSWORD_HERE'),
	(7, '赵红梅', '女', '白云村', '13900139002', '志愿者', 'YOUR_PASSWORD_HERE'),
	(8, '陈书记', '男', '青山镇', '13500135001', '管理员', 'YOUR_PASSWORD_HERE'),
	(9, 'test', NULL, NULL, '18522603368', '农户', 'YOUR_PASSWORD_HERE'),
	(11, 'RefinementTestUser', '女', '涉县涉城镇一村', '13900000003', '农户', 'YOUR_PASSWORD_HERE');

-- 正在导出表  smart_village_db.video_watch_records 的数据：~4 rows (大约)
INSERT INTO `video_watch_records` (`watch_id`, `video_id`, `user_id`, `click_time`, `actual_watch_duration`, `is_finished`) VALUES
	(1, 1, 1, '2024-02-28 19:00:00', 600, 1),
	(2, 2, 2, '2024-02-29 20:00:00', 400, 0),
	(3, 3, 1, '2024-03-05 12:00:00', 300, 1),
	(4, 3, 3, '2024-03-06 13:00:00', 300, 1),
	(5, 1, 5, '2026-03-03 23:25:17', 300, 1),
	(6, 2, 5, '2026-03-03 23:25:19', 300, 1),
	(7, 1, 5, '2026-03-03 23:39:38', 300, 1),
	(8, 4, 4, '2026-03-04 00:13:37', 300, 1),
	(9, 4, 4, '2026-03-04 00:13:40', 300, 1);

-- 正在导出表  smart_village_db.videos 的数据：~3 rows (大约)
INSERT INTO `videos` (`video_id`, `video_topic`, `video_type`, `target_age_group`, `publish_time`, `video_duration`, `video_url`, `cover_url`) VALUES
	(1, '核桃春季水肥管理要点', '农业技术', '40-60岁', '2024-02-20 10:00:00', 600, 'https://oss.example.com/v_walnut.mp4', 'https://oss.example.com/c_walnut.jpg'),
	(2, '花椒高效节水灌溉技术', '农业技术', '30-50岁', '2024-02-25 14:30:00', 450, 'https://oss.example.com/v_pepper.mp4', 'https://oss.example.com/c_pepper.jpg'),
	(3, '乡村用水规范与节水倡议', '普法宣传', '全年龄段', '2024-03-01 09:00:00', 300, 'https://oss.example.com/v_water.mp4', 'https://oss.example.com/c_water.jpg'),
	(4, 'test1', '农业技术', '所有群体', '2026-03-04 00:12:58', 1, 'http://127.0.0.1:8000/uploads/videos/test1.mp4', 'http://127.0.0.1:8000/uploads/pictures/test1.jpg');

-- 正在导出表  smart_village_db.volunteer_feedbacks 的数据：~2 rows (大约)
INSERT INTO `volunteer_feedbacks` (`feedback_id`, `activity_id`, `user_id`, `personal_gain_score`, `organization_score`, `satisfaction_score`, `improvement_suggestion`, `submit_time`) VALUES
	(1, 1, 6, 4.5, 5.0, 4.8, '果农非常热情，建议后续开展更多此类帮扶', '2024-03-16 10:00:00'),
	(2, 1, 7, 5.0, 4.0, 4.5, '午餐分发稍显混乱，建议下次提前登记好人数', '2024-03-16 11:30:00'),
	(3, 2, 7, 5.0, 5.0, 3.0, '111', '2026-03-04 21:30:51');

-- 正在导出表  smart_village_db.water_applications 的数据：~11 rows (大约)
INSERT INTO `water_applications` (`application_id`, `user_id`, `crop_type`, `amount`, `reason`, `apply_time`, `status`, `reject_reason`) VALUES
	(1, 1, '核桃', 2.5, '近期干旱，核桃树需要春季复灌', '2024-03-01 08:30:00', 1, NULL),
	(2, 2, '花椒', 1.5, '花椒苗刚种下，急需浇定根水', '2024-03-02 09:15:00', 1, NULL),
	(3, 3, '苹果', 3.0, '果园大面积缺水，申请长时间灌溉', '2024-03-03 10:00:00', 2, '近期水库水位偏低，建议分批次申请，单次不超过2小时'),
	(4, 4, '蔬菜', 1.0, '大棚蔬菜日常补水', '2024-03-04 07:45:00', 1, NULL),
	(5, 5, '核桃', 2.0, '核桃园追肥后需要浇水', '2024-03-05 14:20:00', 2, NULL),
	(6, 1, '核桃', 3.0, '进入生长期，需增加灌溉量', '2024-04-01 08:00:00', 1, NULL),
	(7, 2, '花椒', 2.0, '天气炎热，土壤水分蒸发快', '2024-04-05 11:30:00', 2, '青山镇东侧主管道正在维修，预计后天恢复供水，请重新申请'),
	(8, 3, '苹果', 2.0, '修改申请时长，重新申请果园浇水', '2024-04-08 09:00:00', 1, NULL),
	(9, 4, '蔬菜', 1.5, '气温回升，大棚需要降温保湿', '2024-04-10 16:10:00', 0, NULL),
	(10, 5, '核桃', 2.5, '周边几家一起浇，申请合并放水', '2024-04-12 10:00:00', 2, '11'),
	(11, 1, '核桃', 1.5, '部分高处地块未浇透，补浇申请', '2024-04-15 08:00:00', 1, NULL),
	(12, 3, '花椒', 2.0, '11', NULL, 2, NULL),
	(13, 5, '核桃', 2.5, '1111', NULL, 2, '111'),
	(14, 5, '核桃', 2.0, '11111', '2026-03-03 23:17:09', 2, '1111');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
