const fs = require('fs');
const parseString = require('xml2js').parseString;
const stringify = require('csv-stringify');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const crawler = require('crawler');

const replaceSpecialCharacters = (text) => text.replace(/[\n]/g, '').replace(/  +/g, ' ').trim();
const input = [];
const output = [];

// this example reads the file synchronously
let xml = fs.readFileSync("sitemap.xml", "utf8");

const createRecords = async input => {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const options = {
        //logLevel: 'info',
        port: chrome.port,
        strategy: "mobile",
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
    };

    for (var i in input) {
        const result = await lighthouse(input[i].url, options);
        output.push({
            'url': input[i].url,
            'version': input[i].version,
            'title': input[i].title,
            'performance': result.lhr.categories.performance.score ? (result.lhr.categories.performance.score * 100).toFixed(0) : 'NA',
            'accessibility': result.lhr.categories.accessibility.score ? (result.lhr.categories.accessibility.score * 100).toFixed(0) : 'NA',
            'best-practices': result.lhr.categories['best-practices'].score ? (result.lhr.categories['best-practices'].score * 100).toFixed(0) : 'NA',
            'seo': result.lhr.categories.seo.score ? (result.lhr.categories.seo.score * 100).toFixed(0) : 'NA'
        });
    }

    await chrome.kill();
    stringify(output, { header: true }, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            fs.writeFile(__dirname + '/output.csv', data, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Success!');
                }
            });
        }
    });
};

const crawlCallback = (error, res, done) => {
    if (error) {
        console.log(error);
    } else {
        const $ = res.$;
        res.options.title = replaceSpecialCharacters($('title').text());
        res.options.version = replaceSpecialCharacters($('meta[name="Generator"]').attr('content'));
        input.push(res.options);
    }
    done();
};

const crawl = new crawler({
    callback: crawlCallback,
});

crawl.on('drain', function () {
    input.sort((item) => item.id);
    createRecords(input);
});

parseString(xml, function (err, result) {
    if (err === null) {
        var rows = result.urlset.url;
        var urls = rows.map(function (row) {
            return {
                'url': row.loc[0],
                'version': '',
                'title': '',
                'performance': '',
                'accessibility': '',
                'best-practices': '',
                'seo': ''
            };
        });

        crawl.queue(urls);
    }
    else {
        console.log(err);
    }
});