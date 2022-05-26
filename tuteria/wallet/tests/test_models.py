import pytest 
from wallet.models import Wallet
from users.models import User

@pytest.fixture
def create_user():
    def _create_user():
        instance, _ = User.objects.get_or_create(
            email="john@example.com", first_name="John", last_name="Example"
        )
        return instance

    return _create_user

@pytest.mark.django_db
def test_setting_user_wallet_as_null(create_user):
    user_instance = create_user()
    assert user_instance.wallet is not None
    user_instance.delete()
    assert Wallet.objects.count() == 1