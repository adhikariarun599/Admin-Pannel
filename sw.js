async function loadPublicArticles() {
    const grid = document.getElementById("publicArticlesGrid");
    if (!grid) return;
    const snap = await db.collection("site_articles").orderBy("createdAt", "desc").get();
    grid.innerHTML = "";
    snap.forEach(doc => {
        const art = doc.data();
        grid.innerHTML += `
            <div class="blog-card">
                ${art.imageUrl ? `<img src="${art.imageUrl}" style="width:100%; height:160px; object-fit:cover; border-radius:8px; margin-bottom:10px;">` : ''}
                <h3>${art.title}</h3>
                <p>${art.desc}</p>
                <span style="color:var(--primary); font-size:0.85rem; font-weight:650;">Read More &rarr;</span>
            </div>`;
    });
}
document.addEventListener("DOMContentLoaded", loadPublicArticles);
