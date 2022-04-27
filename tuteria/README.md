Getting up and running
----------------------

<b>After cloning the repository, Ensure you checkout to the `develop` branch and branch off from there e.g</b>

    $ git clone <source code repo>
    $ git checkout develop
    $ git branch -b <Your reponame>

The steps below will get you up and running with a local development environment. We assume you have the following installed.:

* [Windows and Mac] [Virtualbox](http://download.virtualbox.org/virtualbox/4.3.28/VirtualBox-4.3.28-100309-Win.exe) and [Virtualbox guest additions](http://download.virtualbox.org/virtualbox/4.3.28/Oracle_VM_VirtualBox_Extension_Pack-4.3.28-100309.vbox-extpack)
* [Windows only] [babun]() a cygwin shell for windows
* Ensure your system bios has enabled virtualization.

<b>Windows Only</b>

For windows users you would need to install [babun](http://projects.reficio.org/babun/download) so as to run some of the [docker](https://docs.docker.com/) centric commands. It is a cygwin shell.
It can be downloaded [here](http://projects.reficio.org/babun/download)

After downloading, run the following commands

    $ pact install python-setuptools python-ming
    $ pact install libxml2-devel libxslt-devel libyaml-devel
    $ curl -skS https://bootstrap.pypa.io/get-pip.py | python
    $ pip install virtualenv
    $ curl -skS https://raw.githubusercontent.com/mitsuhiko/pipsi/master/get-pipsi.py | python

[docker](https://docs.docker.com/), [docker-compose](https://docs.docker.com/compose/) and [docker-machine](https://docs.docker.com/machine/) are required to setup the development environment.

    $ curl -L  https://get.docker.com/builds/Windows/x86_64/docker-latest.exe > /bin/docker

    $ curl -L -k https://github.com/docker/machine/releases/download/v0.3.0-rc1/docker-machine_windows-amd64.exe > /bin/docker-machine

    $ pip install -U docker-compose

Then create a development VM with [docker-machine](https://docs.docker.com/machine/)

    $ docker-machine create -d virtualbox dev
    $ docker-machne env dev
    $ eval "$(docker-machne env dev)"


You would need to create a share on virtualbox mapping the source code directory to `tuteria` e.g

    tuteria  C:\<path to cloned directory>

We would need to ssh into the vm and mount the share created on virtualbox

    $ docker-machine ssh dev
    docker@dev$ sudo mkdir /tuteria
    docker@dev$ sudo chmod 777 /tuteria
    docker@dev$ sudo mount -t vboxsf -o uid=1000,gid=1000 tuteria /tuteria
    docker@dev$ exit

Now run the command below to start the server.

    $ docker-compose up -d dev

Since we are running the app in a virtual machine, we need the ip address and it can be gotten by typing:

    $ docker-machine ip dev  

In a few seconds, the app would be live in your browser at  `ipaddress:8000`.

To view logs, run `docker-compose logs dev`

Visit the [Docker](https://docs.docker.com/) to learn more about it.


**Javascript bundling and Sass CSS compilation**

This project makes use of both `sass` and `webpack` in processing `css` and `javascript` respectively.

Make sure that [nodejs_](http://nodejs.org/download/) is installed. Then in the project root run::

    $ npm install -g gulp
    $ npm install -g bower
    $ npm install
    $ bower install

Now to start the sass watcher, run::

    $ gulp watch

To compile and watch javascript files run::

    $ gulp build-dev

It's time to write the code!!!


**Merging Changes to Develop Branch**

After working and you need to merge follow the following steps. <From your branch>

    $ git add :/
    $ git commit -m "Your commit message"
    $ git push
    $ git checkout develop
    $ git merge <your-branch> # Ensure you fix all conflicts
    $ git commit -m "Commit message"
    $ git push

You could download [sourcetree](https://www.sourcetreeapp.com/download) and use that instead

** Updating your branch with new features from `Develop` branch **

In order to get the latest codebase in your local development branch, always merge from the `develop` branch

    $ git merge develop. # fix any conflicts that might arise.

If you need further assistance login to the Hipchat chatroom.

Preparing for production
----------------------

from the `develop` branch run the following commands.

    $ gulp
