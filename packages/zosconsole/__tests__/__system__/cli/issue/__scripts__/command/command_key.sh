#!/bin/bash
set -e

bright zos-console issue command "D T" -k
exit $?
