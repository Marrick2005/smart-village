-- 创建并使用数据库
CREATE DATABASE IF NOT EXISTS smart_village_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_village_db;

-- 1. 用户表 (对应图中：用户)
CREATE TABLE `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户编号(主码)',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `password` VARCHAR(255) COMMENT '登录密码',
  `gender` VARCHAR(10) COMMENT '性别', 
  `township` VARCHAR(100) COMMENT '所属乡镇',
  `contact` VARCHAR(50) COMMENT '联系方式(手机号)',
  `identity_type` VARCHAR(50) COMMENT '身份类型(农户/志愿者/管理员)'
) ENGINE=InnoDB COMMENT='用户信息表';

-- 2. 视频信息表 (对应图中：视频信息)
CREATE TABLE `videos` (
  `video_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '视频编号(主码)',
  `video_topic` VARCHAR(255) NOT NULL COMMENT '视频主题',
  `video_type` VARCHAR(50) COMMENT '视频类型',
  `target_age_group` VARCHAR(50) COMMENT '面向年龄段',
  `publish_time` DATETIME COMMENT '发布时间',
  `video_duration` INT COMMENT '视频时长',
  `video_url` VARCHAR(255) COMMENT 'OSS 视频播放链接',
  `cover_url` VARCHAR(255) COMMENT 'OSS 封面图链接'
) ENGINE=InnoDB COMMENT='视频信息表';

-- 3. 视频观看记录表 (对应图中：视频观看记录 N:N关系)
CREATE TABLE `video_watch_records` (
  `watch_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '观看编号(主码)',
  `video_id` INT NOT NULL COMMENT '视频编号(外码)',
  `user_id` INT NOT NULL COMMENT '用户编号(外码)',
  `click_time` DATETIME COMMENT '点击时间',
  `actual_watch_duration` INT COMMENT '实际观看时长',
  `is_finished` TINYINT(1) COMMENT '是否完播(0:否, 1:是)',
  FOREIGN KEY (`video_id`) REFERENCES `videos`(`video_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='视频观看记录表';

-- 4. 农事问题反馈表 (对应图中：农事问题反馈 1:N关系)
CREATE TABLE `farming_issue_feedbacks` (
  `issue_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '问题编号(主码)',
  `user_id` INT NOT NULL COMMENT '用户编号(外码)',
  `township` VARCHAR(100) COMMENT '所属乡镇',
  `submit_time` DATETIME COMMENT '提交时间',
  `severity` VARCHAR(50) COMMENT '严重程度',
  `issue_type` VARCHAR(50) COMMENT '问题类型',
  `image_url` VARCHAR(255) COMMENT 'OSS 相关图片链接',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='农事问题反馈表';

-- 5. 农事行为记录表 (对应图中：农事行为记录 1:N关系)
CREATE TABLE `farming_behavior_records` (
  `record_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '记录编号(主码)',
  `user_id` INT NOT NULL COMMENT '用户编号(外码)',
  `record_time` DATETIME COMMENT '记录时间',
  `township` VARCHAR(100) COMMENT '所属乡镇',
  `click_count` INT DEFAULT 0 COMMENT '点击次数',
  `farming_stage` VARCHAR(50) COMMENT '农作阶段(萌芽期/生长期/成熟期)',
  `is_adopted_advice` TINYINT(1) COMMENT '是否采纳建议(0:否, 1:是)',
  `reminder_category` VARCHAR(50) COMMENT '提醒类别(浇水/防虫/采摘)',
  `crop_type` VARCHAR(50) COMMENT '作物类型(核桃/花椒等)',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='农事行为记录表';

-- 6. 公益活动表 (对应图中：公益活动)
CREATE TABLE `public_activities` (
  `activity_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '活动编号(主码)',
  `activity_name` VARCHAR(255) NOT NULL COMMENT '活动名称',
  `activity_type` VARCHAR(100) COMMENT '活动类型(农业服务/推荐宣讲/法制教育/文化创作)',
  `start_time` DATETIME COMMENT '开始时间',
  `end_time` DATETIME COMMENT '结束时间',
  `village` VARCHAR(100) COMMENT '展开村庄',
  `activity_description` TEXT COMMENT '活动内容说明',
  `total_budget` DECIMAL(10,2) COMMENT '活动总经费'
) ENGINE=InnoDB COMMENT='公益活动表';

-- 7. 活动参与记录表 (对应图中：活动参与记录 N:N关系)
CREATE TABLE `activity_participations` (
  `participation_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '参与编号(主码)',
  `activity_id` INT NOT NULL COMMENT '活动编号(外码)',
  `user_id` INT NOT NULL COMMENT '用户编号(外码)',
  `role` VARCHAR(100) COMMENT '岗位分工',
  `participation_duration` DECIMAL(5,1) COMMENT '参与时长',
  FOREIGN KEY (`activity_id`) REFERENCES `public_activities`(`activity_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='活动参与记录表';

-- 8. 志愿者反馈表 (对应图中：志愿者反馈)
CREATE TABLE `volunteer_feedbacks` (
  `feedback_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '反馈编号(主码)',
  `activity_id` INT NOT NULL COMMENT '活动编号(外码)',
  `user_id` INT NOT NULL COMMENT '用户编号(外码)',
  `personal_gain_score` DECIMAL(3,1) COMMENT '个人收获评分',
  `organization_score` DECIMAL(3,1) COMMENT '组织协调评分',
  `satisfaction_score` DECIMAL(3,1) COMMENT '满意度评分',
  `improvement_suggestion` TEXT COMMENT '改进建议',
  `submit_time` DATETIME COMMENT '提交时间',
  FOREIGN KEY (`activity_id`) REFERENCES `public_activities`(`activity_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='志愿者反馈表';

-- 9. 活动支出明细表 (对应图中：活动支出明细 1:N关系)
CREATE TABLE `activity_expenses` (
  `expense_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '支出编号(主码)',
  `activity_id` INT NOT NULL COMMENT '活动编号(外码)',
  `expense_type` VARCHAR(100) COMMENT '支出类型(交通费/材料费/宣传费/设备费)',
  `amount` DECIMAL(10,2) COMMENT '金额',
  `remark` TEXT COMMENT '备注说明',
  FOREIGN KEY (`activity_id`) REFERENCES `public_activities`(`activity_id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='活动支出明细表';

-- 10. 方言故事表 (对应文化融合模块上传功能)
CREATE TABLE `dialect_stories` (
  `story_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '故事编号(主码)',
  `title` VARCHAR(255) NOT NULL COMMENT '故事标题',
  `tags` VARCHAR(100) COMMENT '故事标签',
  `audio_url` VARCHAR(255) NOT NULL COMMENT 'OSS 音频链接',
  `user_id` INT COMMENT '上传用户编号(外码)，未登录可为空',
  `upload_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  `status` TINYINT(1) DEFAULT 0 COMMENT '审核状态(0:待审核, 1:已发布)',
  `landmark_id` INT COMMENT '关联的文化地标',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL,
  FOREIGN KEY (`landmark_id`) REFERENCES `red_landmarks`(`landmark_id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='乡村方言故事表';

-- 11. 乡村学堂打卡表 (对应留守陪伴打卡功能)
CREATE TABLE `school_checkins` (
  `checkin_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '打卡编号(主码)',
  `user_id` INT NOT NULL COMMENT '用户编号(外码)',
  `image_url` VARCHAR(255) NOT NULL COMMENT 'OSS 打卡图片/视频链接',
  `checkin_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '打卡时间',
  `status` TINYINT(1) DEFAULT 1 COMMENT '状态(1:正常)',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='乡村学堂打卡记录表';

-- 12. 用水申请表 (对应智慧助农模块用水申请与审批功能)
CREATE TABLE `water_applications` (
  `application_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '申请编号(主码)',
  `user_id` INT NOT NULL COMMENT '用户编号(外码)',
  `crop_type` VARCHAR(50) COMMENT '所种作物(核桃/花椒等)',
  `amount` DECIMAL(5,1) NOT NULL COMMENT '申请时长(小时)',
  `reason` TEXT COMMENT '申请理由',
  `apply_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `status` TINYINT(1) DEFAULT 0 COMMENT '状态(0:待审批, 1:已通过, 2:已拒绝)',
  `reject_reason` TEXT COMMENT '拒绝理由(如果被拒绝)',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='用水申请表';