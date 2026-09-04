async function loadPublicArticles() {
    const grid = document.getElementById("publicArticlesGrid");
    if (!grid) return;
    const snap = await db.collection("site_articles").orderBy("createdAt", "desc").get();
    grid.innerHTML = "";
    snap.forEach(doc => {
        const art = doc.data();
        grid.innerHTML += `
            <div class="blog-card" style="margin-bottom:20px;">
                ${art.imageUrl ? `<img src="${art.imageUrl}" style="width:100%; height:180px; object-fit:cover; border-radius:8px; margin-bottom:12px;">` : ''}
                <h3 style="margin-bottom:8px;">${art.title}</h3>
                <div style="color:var(--text-main); font-size:0.95rem;">${art.desc}</div>
            </div>`;
    });
}
document.addEventListener("DOMContentLoaded", loadPublicArticles);
