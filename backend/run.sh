#!/bin/bash
export PYTHONPATH="/opt/python:${PYTHONPATH:-}"
exec python3 -m gunicorn config.wsgi:application -b 0.0.0.0:8000
