from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, DECIMAL, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    password = Column(String(255), nullable=True) # Added for web login
    gender = Column(String(10))
    township = Column(String(100))
    contact = Column(String(50))
    identity_type = Column(String(50))

    # Relationships
    video_records = relationship("VideoWatchRecord", back_populates="user")
    farming_feedbacks = relationship("FarmingIssueFeedback", back_populates="user")
    farming_records = relationship("FarmingBehaviorRecord", back_populates="user")
    activity_participations = relationship("ActivityParticipation", back_populates="user")
    volunteer_feedbacks = relationship("VolunteerFeedback", back_populates="user")
    dialect_stories = relationship("DialectStory", back_populates="user")
    school_checkins = relationship("SchoolCheckin", back_populates="user")
    water_applications = relationship("WaterApplication", back_populates="user")

class WaterApplication(Base):
    __tablename__ = "water_applications"

    application_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    crop_type = Column(String(50))
    amount = Column(DECIMAL(5,1), nullable=False)
    reason = Column(Text)
    apply_time = Column(DateTime)
    status = Column(Integer, default=0)
    reject_reason = Column(Text)

    user = relationship("User", back_populates="water_applications")

class Video(Base):
    __tablename__ = "videos"

    video_id = Column(Integer, primary_key=True, index=True)
    video_topic = Column(String(255), nullable=False)
    video_type = Column(String(50))
    target_age_group = Column(String(50))
    publish_time = Column(DateTime)
    video_duration = Column(Integer)
    video_url = Column(String(255))
    cover_url = Column(String(255))

    watch_records = relationship("VideoWatchRecord", back_populates="video")

class VideoWatchRecord(Base):
    __tablename__ = "video_watch_records"

    watch_id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.video_id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    click_time = Column(DateTime)
    actual_watch_duration = Column(Integer)
    is_finished = Column(Boolean)

    video = relationship("Video", back_populates="watch_records")
    user = relationship("User", back_populates="video_records")

class FarmingIssueFeedback(Base):
    __tablename__ = "farming_issue_feedbacks"

    issue_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    township = Column(String(100))
    submit_time = Column(DateTime)
    severity = Column(String(50))
    issue_type = Column(String(50))
    image_url = Column(String(255))

    user = relationship("User", back_populates="farming_feedbacks")

class FarmingBehaviorRecord(Base):
    __tablename__ = "farming_behavior_records"

    record_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    record_time = Column(DateTime)
    township = Column(String(100))
    click_count = Column(Integer, default=0)
    farming_stage = Column(String(50))
    is_adopted_advice = Column(Boolean)
    reminder_category = Column(String(50))
    crop_type = Column(String(50))

    user = relationship("User", back_populates="farming_records")

class PublicActivity(Base):
    __tablename__ = "public_activities"

    activity_id = Column(Integer, primary_key=True, index=True)
    activity_name = Column(String(255), nullable=False)
    activity_type = Column(String(100))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    village = Column(String(100))
    activity_description = Column(Text)
    total_budget = Column(DECIMAL(10, 2))

    participations = relationship("ActivityParticipation", back_populates="activity")
    feedbacks = relationship("VolunteerFeedback", back_populates="activity")
    expenses = relationship("ActivityExpense", back_populates="activity")

class ActivityParticipation(Base):
    __tablename__ = "activity_participations"

    participation_id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("public_activities.activity_id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    role = Column(String(100))
    participation_duration = Column(DECIMAL(5, 1))

    activity = relationship("PublicActivity", back_populates="participations")
    user = relationship("User", back_populates="activity_participations")

class VolunteerFeedback(Base):
    __tablename__ = "volunteer_feedbacks"

    feedback_id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("public_activities.activity_id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    personal_gain_score = Column(DECIMAL(3, 1))
    organization_score = Column(DECIMAL(3, 1))
    satisfaction_score = Column(DECIMAL(3, 1))
    improvement_suggestion = Column(Text)
    submit_time = Column(DateTime)

    activity = relationship("PublicActivity", back_populates="feedbacks")
    user = relationship("User", back_populates="volunteer_feedbacks")

class ActivityExpense(Base):
    __tablename__ = "activity_expenses"

    expense_id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("public_activities.activity_id", ondelete="CASCADE"), nullable=False)
    expense_type = Column(String(100))
    amount = Column(DECIMAL(10, 2))
    remark = Column(Text)

    activity = relationship("PublicActivity", back_populates="expenses")

class DialectStory(Base):
    __tablename__ = "dialect_stories"

    story_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    tags = Column(String(100))
    audio_url = Column(String(255), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    upload_time = Column(DateTime)
    status = Column(Integer, default=0) # 0: 待审核, 1: 已通过, 2: 已拒绝
    reject_reason = Column(Text, nullable=True) # 拒绝理由
    landmark_id = Column(Integer, ForeignKey("red_landmarks.landmark_id", ondelete="SET NULL"), nullable=True)

    user = relationship("User", back_populates="dialect_stories")
    landmark = relationship("RedLandmark", back_populates="stories")

class RedLandmark(Base):
    __tablename__ = "red_landmarks"

    landmark_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    latitude = Column(DECIMAL(10, 6), nullable=False)
    longitude = Column(DECIMAL(11, 6), nullable=False)
    create_time = Column(DateTime)
    image_url = Column(String(255), nullable=True)

    stories = relationship("DialectStory", back_populates="landmark")

class SchoolCheckin(Base):
    __tablename__ = "school_checkins"

    checkin_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(255), nullable=False)
    checkin_time = Column(DateTime)
    status = Column(Integer, default=1)

    user = relationship("User", back_populates="school_checkins")
