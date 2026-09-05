async function loadArticles() {
            const list = document.getElementById("articlesList");
            const snap = await db.collection("site_articles").orderBy("createdAt", "desc").get();
            list.innerHTML = "";
            
            if(snap.empty) {
                list.innerHTML = `<p style="color:#64748b; font-size:0.9rem;">कुनै पनि आर्टिकल छैन।</p>`;
                return;
            }

            snap.forEach(doc => {
                const a = doc.data();
                const docId = doc.id;
                
                // यो फिल्टरले त्यो लामो बेसिक्स कोड भएको बक्सलाई एडमिन लिस्टबाट लुकाउँछ
                if (!a.title || a.title.startsWith("data:image") || a.title.length > 150 || a.title.includes("base64")) {
                    return; 
                }
                
                list.innerHTML += `
                    <div style="background:#f1f5f9; padding:10px; border-radius:6px; display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <div style="display:flex; align-items:center; gap:10px; overflow:hidden;">
                            ${a.imageUrl && !a.imageUrl.startsWith("data:image") ? `<img src="${a.imageUrl}" style="width:40px; height:40px; object-fit:cover; border-radius:4px; flex-shrink:0;">` : ''}
                            <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"><strong>[${a.category || 'homepage'}]</strong> ${a.title}</div>
                        </div>
                        <div style="display:flex; gap:6px; flex-shrink:0;">
                            <button class="btn-warning" style="padding:4px 8px; font-size:0.8rem;" onclick="editArticle('${docId}', \`${a.title.replace(/'/g, "\\'")}\`, \`${(a.desc || '').replace(/'/g, "\\'")}\`, \`${a.imageUrl || ''}\`, \`${a.category || 'homepage'}\`)">Edit</button>
                            <button class="btn-danger" style="padding:4px 8px; font-size:0.8rem;" onclick="deleteArticle('${docId}')">Delete</button>
                        </div>
                    </div>`;
            });
        }
