from users.models import User
import pytest


@pytest.mark.django_db
def test_user_creation():
    instance: User = User.objects.create(
        email="james@example.com", first_name="Abiola", last_name="Punn"
    )
    assert instance.first_name == "Abiola"
