// Self-check for src/config.js helpers (run: node nhentai/test_helpers.js).
// Not packaged — the build only globs src/*.js.
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

// Real shapes captured from https://nhentai.net/api/v2/.
const listing = {
    result: [{
        id: 679445, media_id: "4168610",
        english_title: "Omodume BOX 57", japanese_title: "想詰めBOX 57",
        thumbnail: "galleries/4168610/thumb.webp", num_pages: 32, num_favorites: 152
    }],
    num_pages: 95, per_page: 25, total: 2353
};
const gallery = {
    id: 679445, media_id: "4168610",
    title: { english: "Omodume BOX 57", japanese: "想詰めBOX 57", pretty: "Omodume BOX 57" },
    cover: { path: "galleries/4168610/cover.webp.webp" },
    thumbnail: { path: "galleries/4168610/thumb.webp" },
    num_pages: 2, num_favorites: 152, upload_date: 1788851331, scanlator: "",
    tags: [
        { id: 1, type: "tag", name: "big breasts", slug: "big-breasts", url: "/tag/big-breasts/" },
        { id: 2, type: "artist", name: "kushikatsu koumei", slug: "kushikatsu-koumei", url: "/artist/kushikatsu-koumei/" }
    ],
    pages: [
        { number: 1, path: "galleries/4168610/1.webp" },
        { number: 2, path: "galleries/4168610/2.webp" }
    ]
};

const ctx = {
    console,
    Response: { success: (data, next) => ({ code: 0, data, next }), error: (m) => ({ code: 1, data: m }) },
    fetch: (url) => {
        if (url.indexOf("/search") > -1 || url.indexOf("/galleries?page") > -1) {
            return { ok: true, status: 200, json: () => listing };
        }
        return { ok: true, status: 200, json: () => gallery };
    }
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, "src", "config.js"), "utf8"), ctx);

// Helper that eval's an expression inside the same context (top-level `let` isn't on ctx).
const run = (expr) => vm.runInContext(expr, ctx);

assert.strictEqual(run("galleryId('https://nhentai.net/g/679445/')"), "679445");
assert.strictEqual(run("galleryId('https://nhentai.net/g/679445')"), "679445");
assert.strictEqual(run("galleryId('https://nhentai.net/g/679445/1/')"), "679445");
assert.strictEqual(run("galleryId('https://nhentai.net/tag/big-breasts/')"), "");

assert.strictEqual(run("normalizeUrl('https://www.nhentai.net/g/1/')"), "https://nhentai.net/g/1/");
assert.strictEqual(run("normalizeUrl('http://nhentai.net/g/1/')"), "https://nhentai.net/g/1/");

assert.strictEqual(run("galleryTitle({title:{pretty:'P',english:'E'}})"), "P");
assert.strictEqual(run("galleryTitle({english_title:'E'})"), "E");

assert.strictEqual(run("imageUrl('galleries/4168610/1.webp')"), "https://i.nhentai.net/galleries/4168610/1.webp");
assert.strictEqual(run("thumbUrl('/galleries/4168610/cover.webp.webp')"), "https://t.nhentai.net/galleries/4168610/cover.webp.webp");

const item = run("toListItem({id:679445, english_title:'T', thumbnail:'galleries/4168610/thumb.webp', num_pages:32, num_favorites:152})");
assert.strictEqual(item.link, "https://nhentai.net/g/679445/");
assert.strictEqual(item.cover, "https://t.nhentai.net/galleries/4168610/thumb.webp");
assert.strictEqual(item.host, "https://nhentai.net");
assert.strictEqual(item.description, "32 trang · 152 ♥");

const page = run("listResult(API_URL + '/search?query=x&page=1', '1')");
assert.strictEqual(page.code, 0);
assert.strictEqual(page.data.length, 1);
assert.strictEqual(page.next, "2");

const last = run("listResult(API_URL + '/galleries?page=95', '95')");
assert.strictEqual(last.next, "");

console.log("OK — config.js helpers verified against API fixtures");
