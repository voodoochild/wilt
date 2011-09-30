Who I Listen To
---------------

Requirements
------------
- node.js
- socket.io

Aims
----
- show artists based on playcount range
- sort results by name or playcount, ascending and descending

TODO
----
- add form so that Last.fm username isn't hardcoded
- add per-request caching to app.js
- make sure it can handle Last.fm not being available
- add a manifest file so that it can work offline if data is in localStorage
- use jQuery from Google CDN with local fallback
- add a fallback display for browsers that don't have the <progress> element
- add a timestamp to the localStorage cache so that it can be invalidated