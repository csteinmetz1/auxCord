#!/bin/bash


if [[ "$(uname -s)" = 'Linux' ]]; then
    basedir=$(dirname "$(readlink -f "$0" || echo "$(echo "$0" | sed -e 's,\\,/,g')")")
else
    basedir=$(dirname "$(readlink "$0" || echo "$(echo "$0" | sed -e 's,\\,/,g')")")
fi
basedir=$(dirname $(realpath $0))


databaseLocation="$basedir/data/db"

sudo mkdir -p $databaseLocation
sudo chmod 777 $databaseLocation
mongod --dbpath $databaseLocation
