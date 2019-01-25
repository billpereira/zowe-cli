#!/bin/bash
set -e

echo "================Z/OS FILES CREATE DATA-SET-BINARY HELP==============="
bright zos-files create data-set-binary --help
if [ $? -gt 0 ]
then
    exit $?
fi

echo "================Z/OS FILES CREATE DATA-SET-BINARY HELP WITH RFJ==========="
bright zos-files create data-set-binary --help --rfj
exit $?
