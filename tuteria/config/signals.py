from django.dispatch import Signal

successful_payment = Signal(
    providing_args=["booking_order", "amount_paid", "transaction_id", "request"]
)
tutor_closes_booking = Signal(providing_args=["booking_order", "form", "request"])
when_client_closes_session = Signal(providing_args=["booking_order", "form", "request"])


# external models
populate_possible_tutors = Signal(providing_args=["request"])

# tutor_skill model
create_subjects = Signal(providing_args=["tutor_id", "subjects"])

# add tutor to client request pool
add_tutor_to_client_request_pool = Signal(providing_args=["request_id", "tutorskill"])

# add to applicant email list
tutor_applicant_email_list = Signal(providing_args=["user"])

# add to verified tutor email list
verified_tutor_email_list = Signal(providing_args=["user"])
