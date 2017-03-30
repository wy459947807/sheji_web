#!/bin/bash

BRANCH=$(git rev-parse --abbrev-ref HEAD)

open "http://dev-yedian.chinacloudapp.cn/info.php?payload=wechat&branch=$BRANCH"