# Copy angular dist
rm -rf node_modules/@wilfredlopez/react/dist
cp -a ../../dist node_modules/@wilfredlopez/react
cp -a ../../package.json node_modules/@wilfredlopez/react/package.json

# Copy core dist
rm -rf node_modules/@wilfredlopez/wl-components/dist
rm -rf node_modules/@wilfredlopez/wl-components/loader
cp -a ../../../dist node_modules/@wilfredlopez/wl-components/dist
cp -a ../../../loader node_modules/@wilfredlopez/wl-components/loader
cp -a ../../../package.json node_modules/@wilfredlopez/wl-components/package.json


