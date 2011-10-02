wilt = (function() {
    var artists, progress, results;
    
    /**
     * Initialise.
     */
    var init = function() {
        // Bind functions to run when data load is complete.
        $('body').bind('wilt.loaded', function() {
            // show_form_controls();
            show_artists_list(artists);
        });
        
        // Load artists data.
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
        // Make sure socket.io is available.
        if ('undefined' === typeof io) {
            flash("Oops, it looks like the server isn't running.");
            return;
        }
        
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
              <td class="name"><a href="{{url}}">{{name}}</a></td>\
              <td class="plays">{{plays}}</td>\
            </tr>';
        
        for (i = 0; i < data.length; i++) {
            if (null !== data[i] && 'undefined' !== typeof data[i]) {
                markup += Mustache.to_html(template, data[i]);
            }
        }
        results.find('tbody').html(markup);
    };
    
    /**
     * Send flash message to the user.
     */
    var flash = function(message) {
        console.log(message);
    };
    
    /**
     * Filter dataset by number of plays, between min/max.
     */
    var filter_by_plays = function(min, max) {
        min = min || 0;
        max = max || parseInt(artists[1].plays);
        
        var i, artist, data = [];
        for (i = 1; i < artists.length; i++) {
            artist = artists[i]
            if (null !== artist && 'undefined' !== typeof artist) {
                if (artist.plays >= min && artist.plays <= max) {
                    data.push(artist);
                }
                else if (artist.plays < min) {
                    break;
                }
            }
        }
        
        show_artists_list(data);
    };
    
    /**
     * Filter dataset by text search.
     */
    var filter_by_search = function(term) {
        var re = new RegExp(term.replace('*', '.?'), ['i','g']),
            i, artist, data = [];
        
        for (i = 1; i < artists.length; i++) {
            artist = artists[i]
            if (null !== artist && 'undefined' !== typeof artist) {
                if (re.test(artist.name)) {
                    data.push(artist);
                }
            }
        }
        
        show_artists_list(data);
    };
    
    /**
     * Sort displayed data alphabetically.
     */
    var sort_abc = function(direction) {
        // stub
    };
    
    /**
     * Sort displayed data by number of plays.
     */
    var sort_plays = function(direction) {
        // stub
    };
    
    return {
        init: init,
        filter_by_plays: filter_by_plays,
        filter_by_search: filter_by_search
    };
}());

$(document).ready(function() {
    wilt.init();
});