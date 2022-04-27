from bookings.models import Booking
from users.models import UserProfile, PhoneNumber, Location
from external.models import BaseRequestTutor
from wallet.models import Wallet, WalletTransaction
from reviews.models import SkillReview
from allauth.account.models import EmailAddress


def get_duplicate_users_obj(cls, duplicate_email):
    """Get the complete object of the users with duplicate emails"""

    duplicate_users = cls.objects.filter(email__icontains=duplicate_email)
    return duplicate_users


def get_user_to_merge_to(duplicate_users):
    """Get the complete object of the selected user to merge to"""

    # select the user whose email is already in lower case
    lower_case_user = [
        user for user in duplicate_users if user.email == user.email.lower()
    ]

    if len(lower_case_user) > 0:
        return lower_case_user[0]
    # if that is not found, select the first user in the list
    return duplicate_users[0]


def delete_other_user(duplicate_users, user_to_merge_to):
    """Delete user whose references have been removed"""
    user_to_delete = [
        user for user in duplicate_users if user.pk != user_to_merge_to.pk
    ][0]
    user_to_delete.delete()


## related models to update

# emailaddresses
def update_user_emailaddresses(duplicate_user, user_to_merge_to):
    """Update emailaddresses that are related to the users with duplicate emails """

    emailaddresses = EmailAddress.objects.filter(
        user__email__icontains=duplicate_user[0].email.lower()
    )
    emailaddresses.update(user=user_to_merge_to)


# bookings
def update_user_bookings(duplicate_user, user_to_merge_to):
    """Update bookings that are related to the users with duplicate emails """

    bookings = Booking.objects.filter(
        user__email__icontains=duplicate_user[0].email.lower()
    )
    bookings.update(user=user_to_merge_to)


# locations
def update_user_locations(duplicate_user, user_to_merge_to):
    """Update locations that are related to the users with duplicate emails """

    locations = Location.objects.filter(
        user__email__icontains=duplicate_user[0].email.lower()
    )
    locations.update(user=user_to_merge_to)


# baserequesttutors
def update_user_baserequesttutor(duplicate_user, user_to_merge_to):
    """Update base request tutors that are related to the users with duplicate emails """

    baserequesttutors = BaseRequestTutor.objects.filter(
        user__email__icontains=duplicate_user[0].email.lower()
    )
    baserequesttutors.update(user=user_to_merge_to)


# skillreviews
def update_user_skillreviews(duplicate_user, user_to_merge_to):
    """Update skill reviews that are related to the users with duplicate emails """

    skillreviews = SkillReview.objects.filter(
        commenter__email__icontains=duplicate_user[0].email.lower()
    )
    skillreviews.update(commenter=user_to_merge_to)


# wallets
def merge_user_wallets(duplicate_user, user_to_merge_to):
    """
    wallet is connected to wallet transaction models.
    so deleting a user would delete the wallet and the transactions would be lost
    so instead merge the wallets by adding their fields together and update the
    transactions field containing wallet_id to the merged wallet on the wallet
     transaction model
    """

    wallets = Wallet.objects.filter(
        owner__email__icontains=duplicate_user[0].email.lower()
    )
    if wallets.count() > 0:
        merged_wallet = [
            wallet for wallet in wallets if wallet.owner == user_to_merge_to
        ]
        if len(merged_wallet) > 1:
            merged_wallet = merged_wallet[0]
            transactions = WalletTransaction.objects.filter(
                wallet__in=[x for x in wallets]
            )
            transactions.update(wallet=merged_wallet)
            for wallet in wallets:
                if wallet.pk == merged_wallet.pk:
                    continue
                merged_wallet.credits += wallet.credits
                merged_wallet.amount_available += wallet.amount_available
                merged_wallet.amount_in_session += wallet.amount_in_session
                merged_wallet.credit_in_session += wallet.credit_in_session
                merged_wallet.previous_available_balance += (
                    wallet.previous_available_balance
                )
                if (
                    wallet.authorization_code is not None
                    and wallet.authorization_code != ""
                    and merged_wallet.authorization_code is None
                    or merged_wallet.authorization_code == ""
                ):
                    merged_wallet.authorization_code = wallet.authorization_code
            merged_wallet.user = user_to_merge_to
            merged_wallet.save()
    pass


# main function that merges the users
def perform_duplicate_removal(cls):

    all_duplicate_users = cls.objects.get_duplicate_users()

    for duplicate_user_pair in all_duplicate_users:
        duplicate_users = get_duplicate_users_obj(
            cls, duplicate_user_pair["email_lower"]
        )
        user_to_merge_to = get_user_to_merge_to(duplicate_users)

        # update related models
        update_user_bookings(duplicate_users, user_to_merge_to)

        update_user_emailaddresses(duplicate_users, user_to_merge_to)

        update_user_locations(duplicate_users, user_to_merge_to)

        update_user_baserequesttutor(duplicate_users, user_to_merge_to)

        # merge wallet and update transaction reference models
        merge_user_wallets(duplicate_users, user_to_merge_to)
        # delete the other user
        delete_other_user(duplicate_users, user_to_merge_to)
