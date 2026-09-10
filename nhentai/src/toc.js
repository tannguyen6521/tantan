load('config.js');
function execute(url) {
    url = normalizeUrl(url);
    return Response.success([{ name: "Oneshot", url: url, description: "", lock: false, pay: false }]);
}
