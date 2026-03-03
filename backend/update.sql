USE smart_village_db;
ALTER TABLE dialect_stories ADD COLUMN landmark_id INT NULL;
ALTER TABLE dialect_stories ADD CONSTRAINT fk_dialect_landmark FOREIGN KEY (landmark_id) REFERENCES red_landmarks(landmark_id) ON DELETE SET NULL;
