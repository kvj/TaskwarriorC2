#!/bin/bash

version=`node -e "const p = require('./package.json'); console.log(p.version);"`
platform=${1-"linux"}
arch=${2-"all"}

rm -rf out/ .desktop/
npm run dist
cp desktop.js index.js
node_modules/.bin/electron-packager ./ --platform=$platform --arch=$arch \
	--out=out/ --prune --asar \
	--icon=images/app_icon \
	--app-version=$version \
	--ignore="android($|/)" \
	--ignore="ios($|/)" \
	--ignore="app($|/)" \
	--ignore="images($|/)" \
	--ignore=".*config$" \
	--ignore=".git.*$" \
	--ignore=gulpfile.js \
	--ignore=README.md \
	--ignore=index.android.js \
	--ignore=desktop.js
rm index.js
if [ ! -d "out/" ]; then
	echo "Build failure. Exiting"
	exit 1
fi
echo "Making ZIPs..."
cd out/
for dir in */
do
	dir=${dir%*/}
	echo $dir
	zip -r ${dir}-$version.zip $dir
	echo "Uploading to Bitbucket..."
	curl -s -u $BB_USER_PASS -X POST https://api.bitbucket.org/2.0/repositories/kvorobyev/taskwarriorc2/downloads -F files=@${dir}-$version.zip
done
cd ..

