#!/bin/bash
rm -rf ./merged
mkdir ./merged
cp -v ./noto-emoji/* merged
cp -n -v ./twemoji/* merged
