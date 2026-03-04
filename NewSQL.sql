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


-- 导出 smart_village_db 的数据库结构
CREATE DATABASE IF NOT EXISTS `smart_village_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `smart_village_db`;

-- 导出  表 smart_village_db.activity_expenses 结构
CREATE TABLE IF NOT EXISTS `activity_expenses` (
  `expense_id` int NOT NULL AUTO_INCREMENT COMMENT '支出编号(主码)',
  `activity_id` int NOT NULL COMMENT '活动编号(外码)',
  `expense_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '支出类型(交通费/材料费/宣传费/设备费)',
  `amount` decimal(10,2) DEFAULT NULL COMMENT '金额',
  `remark` text COLLATE utf8mb4_unicode_ci COMMENT '备注说明',
  PRIMARY KEY (`expense_id`),
  KEY `activity_id` (`activity_id`),
  CONSTRAINT `activity_expenses_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `public_activities` (`activity_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动支出明细表';

-- 数据导出被取消选择。

-- 导出  表 smart_village_db.activity_participations 结构
CREATE TABLE IF NOT EXISTS `activity_participations` (
  `participation_id` int NOT NULL AUTO_INCREMENT COMMENT '参与编号(主码)',
  `activity_id` int NOT NULL COMMENT '活动编号(外码)',
  `user_id` int NOT NULL COMMENT '用户编号(外码)',
  `role` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '岗位分工',
  `participation_duration` decimal(5,1) DEFAULT NULL COMMENT '参与时长',
  PRIMARY KEY (`participation_id`),
  KEY `activity_id` (`activity_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `activity_participations_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `public_activities` (`activity_id`) ON DELETE CASCADE,
  CONSTRAINT `activity_participations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动参与记录表';

-- 数据导出被取消选择。

-- 导出  表 smart_village_db.dialect_stories 结构
CREATE TABLE IF NOT EXISTS `dialect_stories` (
  `story_id` int NOT NULL AUTO_INCREMENT COMMENT '故事编号(主码)',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '故事标题',
  `tags` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '故事标签',
  `audio_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'OSS 音频链接',
  `user_id` int DEFAULT NULL COMMENT '上传用户编号(外码)，未登录可为空',
  `upload_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  `status` tinyint(1) DEFAULT '0' COMMENT '审核状态(0:待审核, 1:已发布)',
  `landmark_id` int DEFAULT NULL,
  `reject_reason` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`story_id`),
  KEY `user_id` (`user_id`),
  KEY `fk_dialect_landmark` (`landmark_id`),
  CONSTRAINT `dialect_stories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_dialect_landmark` FOREIGN KEY (`landmark_id`) REFERENCES `red_landmarks` (`landmark_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='乡村方言故事表';

-- 数据导出被取消选择。

-- 导出  表 smart_village_db.farming_behavior_records 结构
CREATE TABLE IF NOT EXISTS `farming_behavior_records` (
  `record_id` int NOT NULL AUTO_INCREMENT COMMENT '记录编号(主码)',
  `user_id` int NOT NULL COMMENT '用户编号(外码)',
  `record_time` datetime DEFAULT NULL COMMENT '记录时间',
  `township` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '所属乡镇',
  `click_count` int DEFAULT '0' COMMENT '点击次数',
  `farming_stage` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '农作阶段(萌芽期/生长期/成熟期)',
  `is_adopted_advice` tinyint(1) DEFAULT NULL COMMENT '是否采纳建议(0:否, 1:是)',
  `reminder_category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '提醒类别(浇水/防虫/采摘)',
  `crop_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '作物类型(核桃/花椒等)',
  PRIMARY KEY (`record_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `farming_behavior_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='农事行为记录表';

-- 数据导出被取消选择。

-- 导出  表 smart_village_db.farming_issue_feedbacks 结构
CREATE TABLE IF NOT EXISTS `farming_issue_feedbacks` (
  `issue_id` int NOT NULL AUTO_INCREMENT COMMENT '问题编号(主码)',
  `user_id` int NOT NULL COMMENT '用户编号(外码)',
  `township` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '所属乡镇',
  `submit_time` datetime DEFAULT NULL COMMENT '提交时间',
  `severity` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '严重程度',
  `issue_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '问题类型',
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'OSS 相关图片链接',
  PRIMARY KEY (`issue_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `farming_issue_feedbacks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='农事问题反馈表';

-- 数据导出被取消选择。

-- 导出  表 smart_village_db.public_activities 结构
CREATE TABLE IF NOT EXISTS `public_activities` (
  `activity_id` int NOT NULL AUTO_INCREMENT COMMENT '活动编号(主码)',
  `activity_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '活动名称',
  `activity_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '活动类型(农业服务/推荐宣讲/法制教育/文化创作)',
  `start_time` datetime DEFAULT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `village` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '展开村庄',
  `activity_description` text COLLATE utf8mb4_unicode_ci COMMENT '活动内容说明',
  `total_budget` decimal(10,2) DEFAULT NULL COMMENT '活动总经费',
  PRIMARY KEY (`activity_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公益活动表';

-- 数据导出被取消选择。

-- 导出  表 smart_village_db.red_landmarks 结构
CREATE TABLE IF NOT EXISTS `red_landmarks` (
  `landmark_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `latitude` decimal(10,6) NOT NULL,
  `longitude` decimal(11,6) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`landmark_id`),
  KEY `ix_red_landmarks_landmark_id` (`landmark_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 数据导出被取消选择。

-- 导出  表 smart_village_db.school_checkins 结构
CREATE TABLE IF NOT EXISTS `school_checkins` (
  `checkin_id` int NOT NULL AUTO_INCREMENT COMMENT '打卡编号(主码)',
  `user_id` int NOT NULL COMMENT '用户编号(外码)',
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'OSS 打卡图片/视频链接',
  `checkin_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '打卡时间',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态(1:正常)',
  PRIMARY KEY (`checkin_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `school_checkins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='乡村学堂打卡记录表';

-- 数据导出被取消选择。

-- 导出  表 smart_village_db.users 结构
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int NOT NULL AUTO_INCREMENT COMMENT '用户编号(主码)',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '姓名',
  `gender` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '性别',
  `township` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '所属乡镇',
  `contact` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系方式（手机号）',
  `identity_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '身份类型(农户/志愿者/管理员)',
  `password` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '登录密码',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息表';

-- 数据导出被取消选择。

-- 导出  表 smart_village_db.video_watch_records 结构
CREATE TABLE IF NOT EXISTS `video_watch_records` (
  `watch_id` int NOT NULL AUTO_INCREMENT COMMENT '观看编号(主码)',
  `video_id` int NOT NULL COMMENT '视频编号(外码)',
  `user_id` int NOT NULL COMMENT '用户编号(外码)',
  `click_time` datetime DEFAULT NULL COMMENT '点击时间',
  `actual_watch_duration` int DEFAULT NULL COMMENT '实际观看时长',
  `is_finished` tinyint(1) DEFAULT NULL COMMENT '是否完播(0:否, 1:是)',
  PRIMARY KEY (`watch_id`),
  KEY `video_id` (`video_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `video_watch_records_ibfk_1` FOREIGN KEY (`video_id`) REFERENCES `videos` (`video_id`) ON DELETE CASCADE,
  CONSTRAINT `video_watch_records_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='视频观看记录表';

-- 数据导出被取消选择。

-- 导出  表 smart_village_db.videos 结构
CREATE TABLE IF NOT EXISTS `videos` (
  `video_id` int NOT NULL AUTO_INCREMENT COMMENT '视频编号(主码)',
  `video_topic` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '视频主题',
  `video_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '视频类型',
  `target_age_group` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '面向年龄段',
  `publish_time` datetime DEFAULT NULL COMMENT '发布时间',
  `video_duration` int DEFAULT NULL COMMENT '视频时长',
  `video_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'OSS 视频播放链接',
  `cover_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'OSS 封面图链接',
  PRIMARY KEY (`video_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='视频信息表';

-- 数据导出被取消选择。

-- 导出  表 smart_village_db.volunteer_feedbacks 结构
CREATE TABLE IF NOT EXISTS `volunteer_feedbacks` (
  `feedback_id` int NOT NULL AUTO_INCREMENT COMMENT '反馈编号(主码)',
  `activity_id` int NOT NULL COMMENT '活动编号(外码)',
  `user_id` int NOT NULL COMMENT '用户编号(外码)',
  `personal_gain_score` decimal(3,1) DEFAULT NULL COMMENT '个人收获评分',
  `organization_score` decimal(3,1) DEFAULT NULL COMMENT '组织协调评分',
  `satisfaction_score` decimal(3,1) DEFAULT NULL COMMENT '满意度评分',
  `improvement_suggestion` text COLLATE utf8mb4_unicode_ci COMMENT '改进建议',
  `submit_time` datetime DEFAULT NULL COMMENT '提交时间',
  PRIMARY KEY (`feedback_id`),
  KEY `activity_id` (`activity_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `volunteer_feedbacks_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `public_activities` (`activity_id`) ON DELETE CASCADE,
  CONSTRAINT `volunteer_feedbacks_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='志愿者反馈表';

-- 数据导出被取消选择。

-- 导出  表 smart_village_db.water_applications 结构
CREATE TABLE IF NOT EXISTS `water_applications` (
  `application_id` int NOT NULL AUTO_INCREMENT COMMENT '申请编号(主码)',
  `user_id` int NOT NULL COMMENT '用户编号(外码)',
  `crop_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '所种作物(核桃/花椒等)',
  `amount` decimal(5,1) NOT NULL COMMENT '申请时长(小时)',
  `reason` text COLLATE utf8mb4_unicode_ci COMMENT '申请理由',
  `apply_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `status` tinyint(1) DEFAULT '0' COMMENT '状态(0:待审批, 1:已通过, 2:已拒绝)',
  `reject_reason` text COLLATE utf8mb4_unicode_ci COMMENT '拒绝理由(如果被拒绝)',
  PRIMARY KEY (`application_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `water_applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用水申请表';

-- 数据导出被取消选择。

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
