var options = require('nomnom')
        .opts({
            key: {
                abbr: 'k', full: 'api-key',
                type: 'string', required: true,
                help: 'A Last.fm API key'
            }
        }).parseArgs(),
    http = require('http'),
    app = http.createServer(),
    io = require('socket.io').listen(app);

app.listen(3000);

io.sockets.on('connection', function(socket) {
    socket.on('wilt user', function(data) {
        var lfm = new lastfm.artists(this, data.user);
        lfm.getPage();
    });
});

var lastfm = {};

lastfm.API_KEY = options.key;
lastfm.OPTIONS = {
    host: 'ws.audioscrobbler.com',
    port: 80,
    path: '/2.0/?method=user.gettopartists&user={user}&api_key={key}' +
        '&page={page}&format=json'
};

/**
 * Constructor.
 */
lastfm.artists = function(socket, user) {
    // TODO: add error handling for socket & user.
    this.socket = socket;
    this.user = user;
    this.data = [];
    this.total = 0;
    this.pages = 0;
};

/**
 * Retrieve and process a single page of API results.
 */
lastfm.artists.prototype.getPage = function(n) {
    var self = this,
        page = n || 1;
    
    // Extend lastfm.OPTIONS as required.
    // TODO: this is probably horribly inefficient.
    var options = {
        host: lastfm.OPTIONS.host,
        port: lastfm.OPTIONS.port,
        path: lastfm.OPTIONS.path
            .replace('{user}', this.user)
            .replace('{key}', lastfm.API_KEY)
            .replace('{page}', page)
    };
    
    // Hit the API for the page data.
    http.get(options, function(res) {
        var json = '';
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            json += chunk;
        })
        .on('end', function() {
            json = JSON.parse(json);
            
            console.log('retrieved page ' + page);
            
            // Store the total and number of pages.
            self.total = json.topartists['@attr'].total;
            self.pages = json.topartists['@attr'].totalPages;
            
            // Let the client know how many artists there are.
            self.socket.emit('wilt total', { total: self.total });
            
            // Loop over the data and trim it down a bit.
            var artists = json.topartists.artist,
                artist, rank, _data = [];
            
            // Send data about each artist through the socket.
            for (var i in artists) {
                artist = artists[i];
                rank = artist['@attr'].rank;
                self.data[rank] = {
                    name:  artist.name,
                    plays: artist.playcount,
                    url:   artist.url,
                    image: artist.image[2]['#text']
                };
                
                self.socket.emit('wilt artist data', rank, self.data[rank]);
            }
            
            // Call self.getPage() if this isn't the last page.
            if (page < self.pages) {
                self.getPage(page + 1);
            }
            else {
                self.socket.emit('wilt finished');
            }
        });
    }).on('error', function(err) {
        self.socket.emit('wilt error', err.message);
        throw err.message;
    });
};