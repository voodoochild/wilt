Who I Listen To
---------------

Requirements
------------
- node.js
- socket.io
- nomnom

Aims
----
- show artists based on playcount range
- sort results by name or playcount, ascending and descending
- let the user add two other Last.fm usernames to compare their data against
- it should be possible to apply both text and playcount filters at the same time
- let the user export their filtered data as JSON (won't be on a permaurl)

Credits
-------
- normalize.css
- node.js
- nomnom
- socket.io
- jQuery
- mustache
- modernizr

TODO
----
- add per-request caching to app.js
- add a manifest file so that it can work offline if data is in localStorage
- use jQuery from Google CDN with local fallback
- add a fallback display for browsers that don't have the <progress> element
- invalidate localStorage based on timestamp
- could form controls actually be on some kind of static toolbar?
- make sure that it's possible to view by a specific playcount instead of a range
- display the total number of results for each filter
- display the username of the person whose data you're working on
- add error handling in case localStorage fills up
- make sure that node.js can handle errors, e.g. user doesn't exist, API is down, etc.
- clean inputs (including username) to block XSS
- use Modernizr.load() to capture error when socket.io isn't available