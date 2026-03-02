
import os
import sys

# Add the current directory to sys.path
sys.path.append(os.getcwd())

import database
import models
from routers import school

def debug():
    print("Testing get_user_video_history(user_id=1)...")
    db = next(database.get_db())
    try:
        user_id = 1
        
        print("Constructing subquery...")
        subquery = db.query(
            models.VideoWatchRecord.video_id,
            models.VideoWatchRecord.click_time,
            models.VideoWatchRecord.actual_watch_duration,
            models.VideoWatchRecord.is_finished
        ).filter(models.VideoWatchRecord.user_id == user_id).subquery()
        
        print("Constructing main query...")
        query = db.query(
            models.Video.video_topic,
            subquery.c.click_time,
            subquery.c.actual_watch_duration,
            subquery.c.is_finished
        ).outerjoin(
            subquery, models.Video.video_id == subquery.c.video_id
        ).order_by(
            subquery.c.click_time.desc()
        )
        
        print("Executing query...")
        records = query.all()
        print(f"Query returned {len(records)} records.")
        
        print("Processing records...")
        history = []
        for video_title, click_time, duration, is_finished in records:
            print(f"Row: {video_title}, {click_time}, {duration}, {is_finished}")
            try:
                watch_time = click_time.strftime("%Y-%m-%d %H:%M:%S") if click_time else "-"
            except Exception as e:
                print(f"Error formatting click_time {click_time}: {e}")
                watch_time = "Error"
                
            history.append({
                "video_title": video_title,
                "watch_time": watch_time,
                "duration": duration if duration is not None else 0,
                "is_finished": is_finished if is_finished is not None else False
            })
        print("SUCCESS!")
        
    except Exception as e:
        print("\n--- ERROR DETECTED ---")
        print(f"Type: {type(e).__name__}")
        print(f"Message: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug()
