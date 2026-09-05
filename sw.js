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
            
            // इमेज देखाउने भाग सुरक्षित गर्न चेक थपिएको
            let imageSection = '';
            if (art.imageUrl) {
                // यदि imageUrl मा data:image वा http बाट सुरु भएको सहि लिङ्क छ भने मात्र <img> ट्याग देखाउने
                if (art.imageUrl.startsWith('data:image') || art.imageUrl.startsWith('http')) {
                    imageSection = `<img src="${art.imageUrl}" style="width:100%; height:180px; object-fit:cover; border-radius:8px; margin-bottom:12px;" alt="Thumbnail">`;
                } else {
                    // यदि टेक्स्ट वा गलत डाटा भएमा तल देखाउनबाट जोगाउने
                    imageSection = `<p style="color: red; font-size: 0.8rem;">(इमेज डेटा सही छैन)</p>`;
                }
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
