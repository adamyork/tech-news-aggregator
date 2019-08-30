'use strict';
$(document).ready(function() {

    let JST = window.JST;

    let names = ['Hacker News', 'Lobsters', 'Arstechnica', 'Slashdot'];
    let paths = ['/hn', '/lob', '/ars', '/sd'];
    var columns;

    let addColumn = (name, path, index) => {
        console.log('index is ' + index);
        let inx = index;
        $.get(path, (data) => {
            console.log('index here is ' + inx);
            let column = columns.eq(inx);
            column.append(JST.header({
                source: name
            }));
            _.each(data.articles, function(article) {
                column.append(JST.article({
                    href: article.href,
                    desc: article.desc
                }));
            });
        });
    };

    let init = () => {
        $('body').append(JST.columns());
        columns = $('body').children('#columns').children('.column');
        _.each(names, (name, i) => {
            addColumn(name, paths[i], i);
        });
    };

    init();

});