async function loadPublicArticles() {
    const grid = document.getElementById("publicArticlesGrid");
    if (!grid) return;
    try {
        const snap = await db.collection("site_articles").orderBy("createdAt", "desc").get();
        if (snap.empty) {
            grid.innerHTML = `<p style="text-align:center; color:#64748b;">कुनै पनि आर्टिकल छैन।</p>`;
            return;
        }
        grid.innerHTML = "";
        snap.forEach(doc => {
            const art = doc.data();
            
            // अनावश्यक ब्याकटिक वा स्पेस सफा गर्ने
            let cleanImageUrl = art.imageUrl ? art.imageUrl.replace(/[`']/g, '').trim() : '';
            
            let imageSection = '';
            if (cleanImageUrl) {
                if (cleanImageUrl.startsWith('data:image') || cleanImageUrl.startsWith('http')) {
                    imageSection = `<img src="${cleanImageUrl}" style="width:100%; height:180px; object-fit:cover; border-radius:8px; margin-bottom:12px;" alt="Thumbnail">`;
                }
            }

            // यदि शीर्षक खाली छ वा बेसिक्स कोड हो भने त्यसलाई इग्नोर गर्ने
            if (!art.title || art.title.startsWith("data:image") || art.title.length > 150) {
                return;
            }

            grid.innerHTML += `
                <div class="blog-card" style="background:#fff; padding:1.5rem; border-radius:10px; border:1px solid #e2e8f0; margin-bottom:1.5rem;">
                    ${imageSection}
                    <h3 style="font-size:1.2rem; color:#0f172a; margin-bottom:8px;">${art.title}</h3>
                    <div style="color:#334155; font-size:0.95rem; line-height:1.6;">${art.desc}</div>
                </div>`;
        });
    } catch(e) {
        console.error(e);
    }
}
document.addEventListener("DOMContentLoaded", loadPublicArticles);
