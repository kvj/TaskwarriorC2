#!/bin/bash

platform=${1-"linux"}
version=${2-"SNAPSHOT"}

rm -r out/ .desktop/
npm run dist
cp desktop.js index.js
node_modules/.bin/electron-packager ./ --platform=$platform --arch=all \
	--out=out/ --prune --asar \
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
done
cd ..

