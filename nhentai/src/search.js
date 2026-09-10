load('config.js');
// search.js — keyword search against the API.
function execute(key, page) {
    key = key || "";
    page = page || "1";
    let api = API_URL + "/search?query=" + encodeURIComponent(key) + "&page=" + page;
    return listResult(api, page);
}
