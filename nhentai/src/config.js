// Shared helpers for the nhentai extension.
// nhentai serves HTML pages behind a Cloudflare JS challenge (plain fetch gets 403),
// but /api/v2/* and the image CDN answer normally — so every script talks to the API.
let BASE_URL = "https://nhentai.net";
let API_URL = BASE_URL + "/api/v2";
let IMG_URL = "https://i.nhentai.net";
let THUMB_URL = "https://t.nhentai.net";

// Rewrite an incoming url's host to BASE_URL, keeping path/query.
function normalizeUrl(url) {
    return String(url).replace(/^https?:\/\/[^\/]+/, BASE_URL);
}

// Gallery id from any /g/<id>/ url.
function galleryId(url) {
    let m = /\/g\/(\d+)/.exec(String(url));
    return m ? m[1] : "";
}

// API results carry flat english_title/japanese_title; gallery detail carries {english,japanese,pretty}.
function galleryTitle(g) {
    if (g.title) return g.title.pretty || g.title.english || g.title.japanese || "";
    return g.english_title || g.japanese_title || "";
}

function imageUrl(path) {
    return IMG_URL + "/" + String(path).replace(/^\//, "");
}

function thumbUrl(path) {
    return THUMB_URL + "/" + String(path).replace(/^\//, "");
}

// One API gallery -> one vBook list item. `thumbnail` is a string in listings, {path} in detail.
function toListItem(g) {
    let thumb = g.thumbnail && g.thumbnail.path ? g.thumbnail.path : (g.thumbnail || "");
    let desc = [];
    if (g.num_pages) desc.push(g.num_pages + " trang");
    if (g.num_favorites) desc.push(g.num_favorites + " \u2665");
    return {
        name: galleryTitle(g),
        link: BASE_URL + "/g/" + g.id + "/",
        cover: thumbUrl(thumb),
        description: desc.join(" \u00b7 "),
        host: BASE_URL
    };
}

// Fetch one listing endpoint and turn it into a vBook page.
function listResult(api, page) {
    let response = fetch(api);
    if (!response.ok) return Response.error("HTTP " + response.status);
    let json = response.json();
    let result = json.result || [];
    let data = [];
    for (let i = 0; i < result.length; i++) data.push(toListItem(result[i]));
    let cur = parseInt(page, 10) || 1;
    let next = json.num_pages && cur < json.num_pages ? String(cur + 1) : "";
    return Response.success(data, next);
}
