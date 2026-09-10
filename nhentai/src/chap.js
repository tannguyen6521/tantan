load('config.js');
function execute(url) {
    let id = galleryId(url);
    if (!id) return Response.error("Không tìm thấy ID gallery");

    let response = fetch(API_URL + "/galleries/" + id);
    if (!response.ok) return Response.error("HTTP " + response.status);
    let g = response.json();

    let pages = g.pages || [];
    let data = [];
    for (let i = 0; i < pages.length; i++) {
        if (pages[i].path) data.push(imageUrl(pages[i].path));
    }
    if (!data.length) return Response.error("Không có ảnh cho gallery " + id);
    return Response.success(data);
}
