load('config.js');
function execute(url) {
    let id = galleryId(url);
    if (!id) return Response.error("Không tìm thấy ID gallery");

    let response = fetch(API_URL + "/galleries/" + id);
    if (!response.ok) return Response.error("HTTP " + response.status);
    let g = response.json();

    let tags = [];
    let other = [];
    let artists = [];
    let list = g.tags || [];
    for (let i = 0; i < list.length; i++) {
        let t = list[i];
        let entry = { title: t.name, input: BASE_URL + t.url, script: "gen.js" };
        if (t.type === "tag") tags.push(entry);
        else if (t.type === "artist" || t.type === "group") artists.push(t.name);
        else other.push(entry);
    }

    let info = ["🆔 <b>Mã số:</b> " + id];
    if (g.num_pages) info.push("📄 <b>Quy mô:</b> " + g.num_pages + " trang");
    if (g.num_favorites != null) info.push("❤️ <b>Yêu thích:</b> " + g.num_favorites);
    if (g.upload_date) {
        let d = new Date(g.upload_date * 1000);
        info.push("📅 <b>Đã đăng:</b> " + d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear());
    }

    return Response.success({
        name: galleryTitle(g),
        author: artists.join(", "),
        cover: thumbUrl(g.cover ? g.cover.path : ""),
        description: g.scanlator ? "Nhóm dịch: " + g.scanlator : "",
        detail: info.join("<br>"),
        url: BASE_URL + "/g/" + id + "/",
        type: "comic",
        format: "comic",
        ongoing: false,
        nsfw: true,
        locale: "ja",
        tags: tags,
        genres: other,
        suggests: [],
        reviews: [],
        comments: []
    });
}
