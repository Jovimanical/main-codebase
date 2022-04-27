all: test

test:
	export DJANGO_CONFIGURATION=Test
	python manage.py test --keepdb tests/unit_tests
