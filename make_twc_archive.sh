#!/bin/sh

PWD_DIR=`pwd`
DIR=`mktemp -d`

mkdir -p $DIR/cert


_tw_get_uuid () {
	CMD="echo $1|gawk -F/ '{print \$3}'"
	echo `eval $CMD`
	
}

_tw_config () {
	CMD="task show rc.verbose=nothing $1|gawk '/$1\s(.+)$/ {print \$2}'"
	VALUE=`eval $CMD`
	echo $VALUE
}

_SERVER=`_tw_config taskd.server`
_CRED=`_tw_config taskd.credentials`
_UUID=`_tw_get_uuid $_CRED`
ZIP="$_UUID.`date +%y%m%d%H%M%S`.taskw.zip"

_CA_PEM=`_tw_config taskd.ca`
_KEY_PEM=`_tw_config taskd.key`
_CERT_PEM=`_tw_config taskd.certificate`

_CA_NAME=`basename $_CA_PEM`
_KEY_NAME=`basename $_KEY_PEM`
_CERT_NAME=`basename $_CERT_PEM`

eval "cp $_CA_PEM $DIR/cert/$_CA_NAME"
eval "cp $_KEY_PEM $DIR/cert/$_KEY_NAME"
eval "cp $_CERT_PEM $DIR/cert/$_CERT_NAME"

echo "# Created by make_twc_archive.sh\ntaskd.server=$_SERVER\ntaskd.credentials=$_CRED\ntaskd.ca=cert/$_CA_NAME\ntaskd.key=cert/$_KEY_NAME\ntaskd.certificate=cert/$_CERT_NAME\n" > $DIR/.taskrc.android

cd $DIR && zip -r $PWD_DIR/$ZIP . && cd $PWD_DIR

rm -r $DIR

echo "File $PWD_DIR/$ZIP created"

