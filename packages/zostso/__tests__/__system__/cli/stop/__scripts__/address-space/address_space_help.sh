#!/bin/bash
set -e

bright zos-tso st as -h
if [ $? -gt 0 ]
then
    exit $?
fi

bright zos-tso stop address-space --help --response-format-json
exit $?
