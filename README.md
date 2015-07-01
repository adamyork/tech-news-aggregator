tech-news-aggregator
====================

A simple web application that displays the top articles from various technology related sites.

- Hackernews
- Lobsters
- Arstechnica
- Slashdot

## Instructions 

- install node.js
- clone project or download project zip
- run
````javascript
npm install
````
- cd into dist/ in unpacked location
- run
````javascript
node server.js
````
- open browser and navigate to localhost:8080

## To make modifications to the project.

- install grunt-cli
````javascript
npm install -g grunt-cli
npm install
````
- make changes to source files in main/src/
- run
````javascript
grunt
`````
- stop and restart server