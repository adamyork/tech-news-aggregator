'use strict';
const express = require('express');
const https = require('https');
const cheerio = require('cheerio');
const und = require('underscore-node');
let app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname);
app.get('/', (req, res) => {
    res.render('index.ejs', {
        layout: false
    });
});

let toTitleCase = function(str) {
    var words = str.split(' ');
    words = und.map(words, (word) => {
        let firstChar = word.substr(0, 1);
        let remaining = word.substr(1, word.length);
        return firstChar.toUpperCase() + remaining;
    });
    return words.join(' ');
};

let getResource = function(options, prot, callback) {
    let req = prot.get(options, function(res) {
        var chunks = '';
        res.on('data', (chunk) => {
            chunks += chunk;
        });
        res.on('end', () => {
            callback(chunks);
        });
        req.on('error', (e) => {
            callback(e.message, true);
        });
    });
};

let processDom = function(data, res, postProcess) {
    let $ = cheerio.load(data);
    let items = postProcess($);
    res.send({
        articles: items
    });
};

let mapRequest = function(resource, host, path, prot, postProcess, useDom) {
    app.get(resource, function(req, res) {
        getResource({
            host: host,
            path: path
        }, prot, (data, error) => {
            if (error) {
                res.send({
                    articles: [{
                        href: '',
                        desc: data
                    }]
                });
                return;
            }
            if (useDom) {
                processDom(data, res, postProcess);
            } else {
                res.send({
                    articles: postProcess(data)
                });
            }
        });
    });
};

let postProcessHackerNews = function($) {
    var items = $('.athing td:nth-child(3) a');
    items = und.map(items, (item) => {
        let target = item.attribs.href;
        let base = 'https://news.ycombinator.com/';
        return {
            href: (target.indexOf('item?id=') === -1) ? target : base + target,
            desc: toTitleCase(item.children[0].data||'broken')
        };
    });
    items = und.filter(items, (item) => {
        return item.desc !== 'Broken';
    });
    return items;
};

let postProcessLobsters = function($) {
    var items = $('.link a');
    items = und.map(items, (item) => {
        return {
            href: item.attribs.href,
            desc: toTitleCase(item.children[0].data)
        };
    });
    return items;
};

let postProcessArstechnica = function($) {
    var items = $('.tease.article > a').toArray();
    items = und.map(items, (item) => {
        let descText = item.attribs.href.toString();
        let parts = descText.split('/');
        let descParsed = parts[parts.length - 2];
        let noHyphens = descParsed.split('-').join(' ');
        return {
            href: item.attribs.href,
            desc: toTitleCase(noHyphens)
        };
    });
    return items;
};

let postProcessSlashdot = function($) {
    var items = $('.story span:first-child a').toArray();
    items = und.map(items, (item) => {
        return {
            href: item.attribs.href,
            desc: toTitleCase(item.children[0].data)
        };
    });
    items = und.filter(items, (item) => {
        let regEx = RegExp('\\(.+\\.','g');
        let found = regEx.test(item.desc);
        return !found;
    });
    return items;
};

mapRequest('/hn', 'news.ycombinator.com', '/', https, postProcessHackerNews, true);
mapRequest('/lob', 'lobste.rs', '/', https, postProcessLobsters, true);
mapRequest('/ars', 'arstechnica.com', '/', https, postProcessArstechnica, true);
mapRequest('/sd', 'slashdot.org', '/', https, postProcessSlashdot, true);

app.use('/', express.static(__dirname));
app.listen(8080);

console.log('local application server started on port 8080.');
console.log('ctrl-c to exit.');