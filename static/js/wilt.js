wilt = (function() {
    var artists, progress, results;
    
    /**
     * Initialise.
     */
    var init = function() {
        $('body').bind('wilt.loaded', function() {
            // show_form_controls();
            show_artists_list(artists);
        });
        
        load_artists();
    };
    
    /**
     * Load artists data.
     */
    var load_artists = function() {
        // Load cached data from localStorage, if it exists.
        if (Modernizr.localstorage) {
            var json = localStorage.getItem('wilt.daelen.artists');
            if (null !== json) {
                // TODO: add timestamp checking here
                artists = JSON.parse(json).data;
                $('body').trigger('wilt.loaded');
                return;
            }
        }
        
        // Else, request data from node.
        get_json_from_node();
    };
    
    /**
     * Request artists data from node server.
     */
    var get_json_from_node = function() {
        var total = received = 0;
        artists = [];
        
        // Connect to app.js and supply a username.
        var socket = io.connect('http://localhost:3000');
        socket.emit('wilt user', { user: 'daelen' });
        show_progress();
        
        // Store the total number of artists.
        socket.on('wilt total', function(data) {
            total = data.total;
            show_progress({ max: total });
        });

        // Every time data for an artist is sent through, add it to the list.
        socket.on('wilt artist data', function(rank, artist) {
            artists[rank] = artist;
            show_progress({ value: ++received });
        });

        // Watch for the data being fully loaded.
        socket.on('wilt finished', function() {
            cache_json();
            show_progress({ done: true });
            $('body').trigger('wilt.loaded');
        });
    };
    
    /**
     * Cache artists data in localStorage.
     */
    var cache_json = function() {
        if (Modernizr.localstorage) {
            localStorage.setItem('wilt.daelen.artists',
                JSON.stringify({
                    timestamp: new Date().getTime(),
                    data: artists
                })
            );
        }
    };
    
    /**
     * Show a progress meter.
     */
    var show_progress = function(opts) {
        opts = opts || {};
        
        if ('undefined' === typeof progress) {
            progress = $('<progress>');
            $('[role="main"]').append(progress);
        }
        
        if ('done' in opts && true === opts.done) {
            progress.remove();
        };
        
        if ('max' in opts && !isNaN(opts.max)) {
            progress.attr('max', parseInt(opts.max));
        }
        
        if ('value' in opts && !isNaN(opts.value)) {
            progress.attr('value', parseInt(opts.value));
        }
    };
    
    /**
     * Display list of artists. This will either be the complete
     * dataset or a subset based on applied filters.
     */
    var show_artists_list = function(data) {
        if ('undefined' === typeof results) {
            results = $('<table>\
              <thead>\
                <tr>\
                  <th></th>\
                  <th class="artist">Artist</th>\
                  <th class="plays">Plays</th>\
                </tr>\
              </thead>\
              <tbody>\
              </tbody>\
            </table>');
            $('[role="main"]').append(results);
        }
        
        var i, markup = '',
            template = '<tr>\
              <td>{{rank}}</td>\
              <td><a href="{{url}}">{{name}}</a></td>\
              <td>{{plays}}</td>\
            </tr>';
        for (i = 0; i < data.length; i++) {
            if (null !== data[i] && 'undefined' !== typeof data[i]) {
                data[i]['rank'] = i;
                markup += Mustache.to_html(template, data[i]);
            }
        }
        results.find('tbody').html(markup);
    };
    
    return {
        init: init
    };
}());

$(document).ready(function() {
    wilt.init();
});