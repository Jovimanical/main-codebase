import os
from fabric.api import local, run, cd, env, sudo, settings, lcd
from fabric.decorators import hosts

env.hosts = [
    "sama@tutor-search.tuteria.com",
    "sama@beeola.tuteria.com"
    # 'sama@tutor-search.tuteria.com'
]
# env.hosts = [
#     'backup.tuteria.com','tutor-search.tuteria.com'
# ]
password = os.getenv("PRODUCTION_PASSWORD", "")


def common_code(code_dir, script, proceed=True, branch="master"):
    with settings(user="sama", password=password):
        with cd(code_dir):
            run("pwd")
            run("git checkout -f %s" % branch)
            if "code" in code_dir:
                run("git pull -f")
            else:
                run("git pull -f")
            run(script)
            # run('docker rmi $(docker images --filter "dangling=true" -q --no-trunc)')
            # if proceed:
            #     new_dir = "/home/sama/tuteria"
            #     with cd(new_dir):
            #         sudo("docker-compose up -d app")
            # sudo(
            # # "docker exec -it tuteria_app_1 python manage.py migrate external"
            #     "docker exec -it tuteria_app_1 python manage.py migrate external"
            # )
            # sudo("docker exec -it tuteria_app_1 python manage.py migrate pricings")
            # sudo("docker-compose build celery")
            # sudo("docker-compose up -d celery")


@hosts("sama@tutor-search.tuteria.com")
def deploy_dev(build_no=9):
    code_dir = "/home/sama/development/tuteria-deploy"
    with settings(user="sama", password=password):
        with cd(code_dir):
            run("pwd")
            print(build_no)
            run("DEV_DEPLOY_VERSION={} docker-compose pull app2".format(build_no))
            run("DEV_DEPLOY_VERSION={} docker-compose up -d app2".format(build_no))
            run("docker image prune -f")
            run("docker container prune -f")


@hosts("sama@beeola.tuteria.com")
def run_tests(build_no=9):
    code_dir = "/home/sama/tuteria-projects/tuteria-deploy"
    with settings(user="sama", password=password):
        with cd(code_dir):
            run("pwd")
            run("DEV_DEPLOY_VERSION={} docker-compose pull app2".format(build_no))
            run(
                "DEV_DEPLOY_VERSION={} docker-compose run app2 /bin/bash /scripts/run_test.sh /home/app/source".format(
                    build_no
                )
            )
            run("docker image prune -f")
            run("docker container prune -f")


@hosts("sama@release.tuteria.com")
def deploy_staging(build_no=9):
    code_dir = "/home/sama/tuteria-projects/tuteria-deploy"
    with settings(user="sama", password=password):
        with cd(code_dir):
            run("pwd")
            print(build_no)
            run("DEV_DEPLOY_VERSION={} docker-compose pull app2".format(build_no))
            run("docker-compose up -d app2")
            run("docker image prune -f")
            run("docker container prune -f")


@hosts("sama@web2.tuteria.com")
def deploy_production(build_no=9):
    w_images()


@hosts("sama@tutor-search.tuteria.com")
def deploy_current(branch="master"):
    print("hello World")
    run("pwd")
    code_dir = "/home/sama/code/tuteria"
    common_code(code_dir, "./boot_app.sh", branch=branch)


def update_images(scale=1, celery=False, callback=None):
    with settings(user="sama", password=password):
        with cd("/home/sama/tuteria"):
            sudo("docker-compose pull app")
            if callback:
                callback()
                pass
            else:
                sudo("docker-compose up -d --scale app={} app".format(scale))
                if celery:
                    sudo("docker-compose up -d --scale worker={} worker ".format(scale))


@hosts("sama@backup.tuteria.com")
def u_images():
    update_images()
    # sudo('docker rmi $(docker images --filter "dangling=true" -q --no-trunc)')


@hosts("sama@tutor-search.tuteria.com")
def t_images():
    def callback():
        with settings(user="sama", password=password):
            with cd("/home/sama/tuteria"):
                sudo("docker-compose build celery")
                sudo("docker-compose up -d worker celery worker_drips worker_jobs")
                sudo("docker-compose up -d --scale worker=2 worker")

    update_images(callback=callback)
    # sudo('docker rmi $(docker images --filter "dangling=true" -q --no-trunc)')


@hosts("sama@backup.tuteria.com")
def backup_db():
    with settings(user="sama", password=password):
        run("/home/sama/tuteria/deploy/postgres-backup.sh")


@hosts("sama@tuteria.com")
def deploy_current2():
    # code_dir = '/root/tuteria'
    def callback():
        with settings(user="sama", password=password):
            with cd("/home/sama/tuteria"):
                sudo("docker-compose kill webserver webserver2 assets")
                sudo("docker-compose rm -f webserver webserver2 assets")
                sudo("docker volume rm tuteria_media_backups")
                sudo("docker-compose pull assets")
                sudo("docker-compose pull app")
                sudo("docker-compose pull marketing-pages")
                sudo("docker-compose up -d webserver webserver2")
                sudo("docker-compose up -d marketing-pages")
                sudo(
                    'docker rmi $(docker images --filter "dangling=true" -q --no-trunc)'
                )
                sudo("docker-compose run app")

    update_images(callback=callback)


@hosts("sama@web2.tuteria.com")
def deploy_staging_server():
    with cd("/home/sama/tuteria"):
        # run("git pull upstream")
        run("docker-compose pull app3")
        run("docker-compose kill app3")
        run("docker-compose rm -f app3")
        run("docker-compose up -d app3")
        run('docker rmi $(docker images --filter "dangling=true" -q --no-trunc)')


@hosts("sama@web2.tuteria.com")
def w_images():
    with cd("/home/sama/tuteria"):
        # run("git pull upstream master")
        run("docker-compose pull app")
        run("docker-compose kill app2")
        run("docker-compose rm -f app2")
        # run("docker-compose run app2 python manage.py collectstatic --noinput")
        run("docker-compose up -d --scale app2=2 app2")
        run('docker rmi $(docker images --filter "dangling=true" -q --no-trunc)')


@hosts("sama@staging-prod.tuteria.com")
def s_images():
    with cd("/home/sama/tuteria-codebase/tuteria-deploy"):
        # run("git pull upstream master")
        run("docker-compose pull app")
        run("docker-compose kill app2")
        run("docker-compose rm -f app2")
        # run("docker-compose run app2 python manage.py collectstatic --noinput")
        run("docker-compose up -d app2")
        run('docker rmi $(docker images --filter "dangling=true" -q --no-trunc)')


def restart_server():
    with settings(user="root", password=password):
        code_dir = "/root/tuteria"
        with cd(code_dir):
            sudo("pwd")
            sudo("git pull")
            sudo("./boot_app.sh")
            new_dir = "/home/sama/tuteria"
            with cd(new_dir):
                sudo("docker-compose up -d app")


def ccelery():
    with settings(user="sama", password=password):
        new_dir = "/home/sama/tuteria"
        with cd(new_dir):
            sudo("docker-compose build celery")
            sudo("docker-compose up -d celery")
            sudo("docker exec -i -t tuteria_celery_1 rm /tmp/celerybeat.pid")


def deploy_admin():
    with settings(user="root", password=password):
        new_dir = "/home/sama/tuteria"
        with cd(new_dir):
            sudo("docker-compose kill admin")
            sudo("docker-compose up -d admin")


def docker_bash():
    with settings(user="root", password=password):
        sudo("docker exec -i -t tuteria_celery_1 bash")


def app_bash():
    with settings(user="root", password=password):
        sudo("docker exec -i -t tuteria_app_1 bash")


def tuteria_bash():
    with settings(user="root", password=password):
        sudo("docker exec -i -t tuteria_app_1 python manage.py shell_plus")


def show_logs():
    with settings(user="root", password=password):
        new_dir = "/home/sama/tuteria"
        with cd(new_dir):
            sudo("docker-compose logs --follow app")


def prepare_local():
    local("git add --all")
    local("git commit")
    local("git push")


def deploy():
    code_dir = "/root/tuteria"
    with cd(code_dir):
        run("git pull")


def prepare_remote():
    run("cd ~/tuteria/")
    run("git pull && docker build - t=gbozee/tuteria . ")
    run("cd /home/sama/tuteria && docker-compose build && docker-compose up -d")
    run(" docker exec -i -t tuteria_celery_1 rm /tmp/celerybeat.pid")


def test_ci():
    with lcd("tuteria"):
        local(
            "rm -rf tuteria/.cache tuteria/users/tests/__pycache__ tuteria/skills/tests/__pycache"
        )
        local("py.test users/tests skills/tests")


def test_skill():
    with lcd("tuteria"):
        local(
            "rm -rf tuteria/.cache tuteria/users/tests/__pycache__ tuteria/skills/tests/__pycache"
        )
        local("py.test skills/tests")


def test_user():
    with lcd("tuteria"):
        local(
            "rm -rf tuteria/.cache tuteria/users/tests/__pycache__ tuteria/skills/tests/__pycache"
        )
        local("py.test users/tests")


def test():
    with lcd("tuteria"):
        local("py.test users skills external bookings")


def local_env(command):
    with lcd("."):
        local(command)


def test_external():
    with lcd("tuteria"):
        local("rm -rf tuteria/.cache tuteria/external/tests/__pycache__")
        local("py.test external/tests")


def setup_database():
    with lcd("../tuteria-deploy"):
        local("docker-compose -f dev.yml up -d")
    with lcd("."):
        local("docker-compose -f dev.yml up -d django")


def server_logs():
    local_env("docker-compose -f dev.yml logs --follow --tail=10 django")


def build():
    local_env("docker-compose -f dev.yml build django")


def dev_shell():
    local_env("docker exec -i -t tuteria_django_1 python manage.py shell_plus")


def console():
    local_env("docker exec -i -t tuteria_django_1 bash")


def build_image():
    local_env(
        "docker build -f compose/django/Dockerfile -t=registry.gitlab.com/tuteria/tuteria ."
    )


def remove_cache():
    with lcd("."):
        local('find . | grep -E "(__pycache__ |\.pyc |\.pyo$)" | xargs rm -rf')


def test_console():
    local_env("docker-compose -f test.yml rm test")
    local_env("docker-compose -f test.yml run test bash")


def base_remote(func):
    with settings(user="sama", password=password):
        new_dir = "/home/sama/tuteria"
        with cd(new_dir):
            func()


@hosts("sama@services.tuteria.com")
def restart_workers():
    with cd("/homa/sama/tuteria"):
        sudo("docker-compose -f dev.yml kill celery worker")
        sudo("docker-compose -f dev.yml up -d celery worker")
        sudo(
            "docker-compose -f dev.yml run celery celery worker -A config -E -l info --concurrency=2 --hostname=sitemaps -Q sitemaps"
        )


def create_user():
    def commands():
        sudo("docker exec -it tuteria_app_1 python manage.py createsuperuser")
        sudo("docker exec -it tuteria_app_1 python manage.py shell_plus")

    base_remote(commands)


@hosts("sama@services.tuteria.com")
def clean_celery_containers():
    with cd("/home/sama/tuteria"):
        command = """
        for i in `seq 1 50`; do
            docker kill tuteria_celery_run_$i
            docker rm tuteria_celery_run_$i
        done    
        """
        sudo(command)


def check_memory():
    run("free -m")


# for i in `seq 1 50`; do
#     docker rm tuteria_celery_run_$i
# done
def start_local():
    local("source venv3/Scripts/activate")
    local("source startup3.sh")


def sample():
    print("Hello")
