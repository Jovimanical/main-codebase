from django.dispatch import Signal

signup_reward = Signal(providing_args=["user"])
complete_profile_reward = Signal(providing_args=["user"])
upload_photo_reward = Signal(providing_args=["user"])
upload_video = Signal(providing_args=["user"])
repeat_client_booking = Signal(providing_args=["tutor", "user"])
background_checked = Signal(providing_args=["user"])
receive_review_reward = Signal(providing_args=["user", "rating", "giver"])
cancel_class = Signal(providing_args=["user"])
reschedule_reward = Signal(providing_args=["user"])
