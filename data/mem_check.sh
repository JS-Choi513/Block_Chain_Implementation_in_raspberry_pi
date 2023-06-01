#!/bin/bash

while :
do
    free -m  | grep -n 'Mem' |&tee -a memlog.txt
    sleep 5
done
