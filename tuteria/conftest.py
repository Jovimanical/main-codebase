# from django.conf import settings
import pytest
# from selenium.webdriver import Firefox

# Make sure that the application source directory (this directory's parent) is
# on sys.path.


@pytest.yield_fixture(scope="session")
def webdriver():
    driver = Firefox()
    yield driver
    driver.quit()
