"use strict";
$( document ).ready( function() {

    var _names = [ "Hacker News", "Lobsters", "Arstechnica", "Slashdot" ];
    var _paths = [ "/hn", "/lob", "/ars", "sd" ];
    var _columns;

    var _addColumn = function( name, path, index ) {
        $.get( path, function( data ) {
            var column = _columns.eq( index );
            column.append( JST.header( {
                source: name
            } ) );
            _.each( data.articles, function( article ) {
                column.append( JST.article( {
                    href: article.href,
                    desc: article.desc
                } ) );
            } );
        } );
    };

    var _init = function() {
        $( "body" ).append( JST.columns() );
        _columns = $( "body" ).children( "#columns" ).children( ".column" );
        _.each( _names, function( name, i ) {
            _addColumn( name, _paths[ i ], i );
        } );
    };

    _init();

} );