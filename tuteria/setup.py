#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys


try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

import tuteria

version = tuteria.__version__

setup(
    name="Tuteria",
    version=version,
    author="",
    author_email="gbozee@gmail.com",
    packages=["tuteria"],
    include_package_data=True,
    install_requires=["Django>=1.7.1"],
    zip_safe=False,
    scripts=["tuteria/manage.py"],
)
