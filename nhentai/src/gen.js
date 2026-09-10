load('config.js');
// gen.js — listing script for the home/genre tabs. `url` is a tag page (or BASE_URL for
// the front page); the tag slug is re-queried against the API because tag HTML is challenged.
function execute(url, page) {
    url = url || BASE_URL;
    page = page || "1";
    let tag = /\/tag\/([^\/?]+)/.exec(url);
    let api;
    if (tag) {
        api = API_URL + "/search?query=" + encodeURIComponent('tag:"' + tag[1] + '"') + "&page=" + page;
    } else {
        api = API_URL + "/galleries?page=" + page;
    }
    return listResult(api, page);
}
