#!/usr/bin/env python
import os
import sys
import warnings

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    os.environ.setdefault("DJANGO_CONFIGURATION", "Local")
    if not sys.warnoptions:
        warnings.simplefilter("ignore")
    from configurations.management import execute_from_command_line

    execute_from_command_line(sys.argv)
