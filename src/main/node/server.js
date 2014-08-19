"use strict";
var express = require( "express" );
var http = require( "http" );
var https = require( "https" );
var jsdom = require( "jsdom" );
var app = express();
var und = require( 'underscore-node' );

app.set( "view engine", "ejs" );
app.set( "views", __dirname );
app.get( "/", function( req, res ) {
    res.render( "index.ejs", {
        layout: false
    } );
} );

var _toTitleCase = function( str ) {
    var words = str.split( " " );
    words = und.map( words, function( word ) {
        var firstChar = word.substr( 0, 1 );
        var remaining = word.substr( 1, word.length );
        return firstChar.toUpperCase() + remaining;
    } );
    return words.join( " " );
};

var _getResource = function( options, prot, callback ) {
    var req = prot.get( options, function( res ) {
        var chunks = [];
        res.on( "data", function( chunk ) {
            chunks.push( chunk );
        } );
        res.on( "end", function() {
            var body = Buffer.concat( chunks );
            callback( body );
        } );
        req.on( "error", function( e ) {
            callback( e.message, true );
        } );
    } );
};

var _processDom = function( data, res, postProcess ) {
    jsdom.env( {
        html: data,
        scripts: [
            '../bower_components/jquery/dist/jquery.js',
        ],
        done: function( errors, window ) {
            if ( errors ) {
                var errorStr = "An error occured when processing the document.\n";
                und.each( errors, function( error ) {
                    errorStr += ( error.message + "\n" );
                } );
                res.send( {
                    articles: [ {
                        href: "",
                        desc: errorStr
                    } ]
                } );
                return;
            }
            var $ = window.$;
            var items = postProcess( $ );
            res.send( {
                articles: items
            } );
        }
    } );
};

var _mapRequest = function( resource, host, path, prot, postProcess, useDom ) {
    app.get( resource, function( req, res ) {
        _getResource( {
            host: host,
            path: path
        }, prot, function( data, error ) {
            if ( error ) {
                res.send( {
                    articles: [ {
                        href: "",
                        desc: data
                    } ]
                } );
                return;
            }
            if ( useDom ) {
                _processDom( data, res, postProcess );
            } else {
                res.send( {
                    articles: postProcess( data )
                } );
            }
        } );
    } );
};

var _postProcessHackerNews = function( data ) {
    try {
        var items = JSON.parse( data ).items;
        items = und.map( items, function( item ) {
            return {
                href: item.url,
                desc: _toTitleCase( item.title )
            };
        } );
        return items;
    } catch ( err ) {
        var items = [ {
            href: "",
            desc: "An error occured when processing the document."
        } ];
        return items;
    }
};

var _postProcessLobsters = function( $ ) {
    var items = $( ".link a" );
    items = und.map( items, function( item ) {
        return {
            href: item.href,
            desc: _toTitleCase( item.innerHTML )
        };
    } );
    return items;
};

var _postProcessArstechnica = function( $ ) {
    var items = $( ".post article > a" ).toArray();
    items = und.map( items, function( item ) {
        var descText = item.href.toString();
        var parts = descText.split( "/" );
        var descParsed = parts[ parts.length - 2 ];
        var noHyphens = descParsed.split( "-" ).join( " " );
        return {
            href: item.href,
            desc: _toTitleCase( noHyphens )
        };
    } );
    return items;
};

var _postProcessSlashdot = function( $ ) {
    var items = $( ".story-header h1 a" );
    items = und.map( items, function( item ) {
        var replaced = item.href.replace( "file", "http" );
        return {
            href: replaced,
            desc: _toTitleCase( item.innerHTML )
        };
    } );
    return items;
};
_mapRequest( "/hn", "api.ihackernews.com", "/page", http, _postProcessHackerNews );
_mapRequest( "/lob", "lobste.rs", "/", https, _postProcessLobsters, true );
_mapRequest( "/ars", "arstechnica.com", "/", http, _postProcessArstechnica, true );
_mapRequest( "/sd", "beta.slashdot.org", "/", http, _postProcessSlashdot, true );

app.use( "/", express.static( __dirname ) );
app.listen( 8080 );

console.log( "local application server started on port 8080." );
console.log( "ctrl-c to exit." );