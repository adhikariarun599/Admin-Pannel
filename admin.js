const firebaseConfig = {
    apiKey: "AIzaSyBLIgjthPddTsuf8mR4Y6fq8ETsolelhOY",
    authDomain: "arun-courses.firebaseapp.com",
    projectId: "arun-courses",
    storageBucket: "arun-courses.firebasestorage.app",
    messagingSenderId: "532244891416",
    appId: "1:532244891416:web:90b7d7c65c047d799e406d"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let adminUser = "admin";
let adminPass = "Admin@12345";

async function loadCredentials() {
    try {
        const doc = await db.collection("settings").doc("admin_auth").get();
        if (doc.exists) {
            if (doc.data().username) adminUser = doc.data().username;
            if (doc.data().password) adminPass = doc.data().password;
        }
    } catch(e) {}
}

if (localStorage.getItem("is_admin_logged") === "true") { showDashboard(); }

async function handleLogin() {
    await loadCredentials();
    const u = document.getElementById("usernameInput").value.trim();
    const p = document.getElementById("passwordInput").value.trim();
    if (u === adminUser && p === adminPass) {
        localStorage.setItem("is_admin_logged", "true");
        showDashboard();
    } else { alert("❌ गलत Username वा Password!"); }
}

function handleLogout() { localStorage.removeItem("is_admin_logged"); location.reload(); }
function showDashboard() {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("dashboardScreen").style.display = "block";
    loadArticles(); loadPendingPayments(); loadCourses();
}

function switchTab(tabName, btn) {
    document.querySelectorAll(".tab-pane").forEach(p => p.style.display = "none");
    document.querySelectorAll(".admin-tab-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");

    if (tabName === 'articles') { document.getElementById("tabArticles").style.display = "block"; loadArticles(); }
    if (tabName === 'pending') { document.getElementById("tabPending").style.display = "block"; loadPendingPayments(); }
    if (tabName === 'courses') { document.getElementById("tabCourses").style.display = "block"; loadCourses(); }
    if (tabName === 'lessons') { document.getElementById("tabLessons").style.display = "block"; loadCourseDropdown(); }
    if (tabName === 'qr') { document.getElementById("tabQr").style.display = "block"; loadQr(); }
    if (tabName === 'notice') { document.getElementById("tabNotice").style.display = "block"; }
}

function compressImage(file, maxWidth = 500, quality = 0.5) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width, height = img.height;
                if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
        };
    });
}

async function insertImageIntoContent(input) {
    if (input.files && input.files[0]) {
        const compressedBase64 = await compressImage(input.files[0], 600, 0.5);
        const textarea = document.getElementById("artDesc");
        const imgTag = `\n<img src="${compressedBase64}" style="max-width:100%; border-radius:6px; margin:10px 0;" alt="Article Image">\n`;
        const startPos = textarea.selectionStart, endPos = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, startPos) + imgTag + textarea.value.substring(endPos, textarea.value.length);
        alert("✅ फोटो सफलतापूर्वक कन्टेन्टभित्र राखियो!");
    }
}

async function publishArticle() {
    const id = document.getElementById("editingArticleId").value;
    const title = document.getElementById("artTitle").value.trim();
    const desc = document.getElementById("artDesc").value.trim();
    const category = document.getElementById("artCategory").value;
    const fileInput = document.getElementById("artImageInput");
    let imageUrl = document.getElementById("artExistingImg").value;

    if(!title || !desc) { alert("शीर्षक र विवरण भर्नुहोस्!"); return; }
    if(fileInput.files.length > 0) { imageUrl = await compressImage(fileInput.files[0], 500, 0.5); }

    const articleData = { title, desc, category, imageUrl, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };

    try {
        if(id && id !== "") {
            await db.collection("site_articles").doc(id).update(articleData);
            alert("✅ आर्टिकल सफलतापूर्वक अपडेट भयो!");
        } else {
            articleData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection("site_articles").add(articleData);
            alert("✅ नयाँ आर्टिकल सफलतापूर्वक पब्लिश भयो!");
        }
        resetArticleForm(); 
        loadArticles();
    } catch (err) { 
        alert("❌ त्रुटी: " + err.message); 
    }
}

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
        
        if (!a.title || a.title.trim() === "" || a.title.startsWith("data:image")) {
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

function editArticle(id, title, desc, imageUrl, category) {
    document.getElementById("editingArticleId").value = id;
    document.getElementById("artTitle").value = title;
    document.getElementById("artDesc").value = desc;
    document.getElementById("artCategory").value = category || 'homepage';
    document.getElementById("artExistingImg").value = imageUrl;
    document.getElementById("articleFormHeading").innerText = "Edit Article";
    document.getElementById("pubArticleBtn").innerText = "Update Article";
    document.getElementById("cancelArticleBtn").style.display = "inline-block";
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function resetArticleForm() {
    document.getElementById("editingArticleId").value = "";
    document.getElementById("artTitle").value = "";
    document.getElementById("artDesc").value = "";
    document.getElementById("artCategory").value = "homepage";
    document.getElementById("artImageInput").value = "";
    document.getElementById("artExistingImg").value = "";
    document.getElementById("articleFormHeading").innerText = "Add New Article (For AdSense & News)";
    document.getElementById("pubArticleBtn").innerText = "Publish Article";
    document.getElementById("cancelArticleBtn").style.display = "none";
}

async function deleteArticle(id) {
    if(confirm("के तपाईं यो आर्टिकल मेटाउन चाहनुहुन्छ?")) { 
        await db.collection("site_articles").doc(id).delete(); 
        loadArticles(); 
    }
}

async function loadPendingPayments() {
    const tbody = document.getElementById("pendingTableBody");
    const snap = await db.collection("enrollments").where("status", "==", "pending").get();
    tbody.innerHTML = "";
    if(snap.empty) { tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">कुनै पनि पेन्डिङ पेमेन्ट छैन।</td></tr>`; return; }
    snap.forEach(doc => {
        const d = doc.data();
        tbody.innerHTML += `
            <tr>
                <td>${d.studentName}<br><small>${d.studentEmail}</small></td>
                <td>${d.courseTitle}<br><b>रु. ${d.payableAmount}</b></td>
                <td>
                    ${d.proofImage ? `<img src="${d.proofImage}" style="width:50px; height:50px; object-fit:cover; border-radius:4px; cursor:pointer; border:1px solid #cbd5e1;" onclick="openProofModal('${d.proofImage}')">` : 'No Image'}
                </td>
                <td>
                    <div style="display:flex; gap:6px;">
                        <button class="btn-success" style="padding:5px 10px; font-size:0.85rem;" onclick="approvePayment('${doc.id}', '${d.studentEmail}', '${d.courseKey}')">Approve</button>
                        <button class="btn-danger" style="padding:5px 10px; font-size:0.85rem;" onclick="rejectPayment('${doc.id}')">Reject</button>
                    </div>
                </td>
            </tr>`;
    });
}

function openProofModal(imgSrc) {
    document.getElementById("modalProofImg").src = imgSrc;
    document.getElementById("proofModal").style.display = "flex";
}

async function approvePayment(id, email, courseKey) {
    await db.collection("enrollments").doc(id).update({ status: "approved" });
    const userSnap = await db.collection("users").where("email", "==", email.toLowerCase()).get();
    if(!userSnap.empty) {
        const uRef = userSnap.docs[0].ref;
        let courses = userSnap.docs[0].data().enrolledCourses || [];
        if(!courses.includes(courseKey)) { courses.push(courseKey); await uRef.update({ enrolledCourses: courses }); }
    }
    alert("✅ सफलतापूर्वक अप्रुभ भयो!"); loadPendingPayments();
}

async function rejectPayment(id) {
    if(confirm("के तपाईं यो पेमेन्ट अनुरोध खारेज (Reject) गर्न चाहनुहुन्छ?")) {
        await db.collection("enrollments").doc(id).delete();
        alert("❌ पेमेन्ट अस्वीकार गरियो!");
        loadPendingPayments();
    }
}

async function loadCourses() {
    const list = document.getElementById("coursesList");
    const snap = await db.collection("site_courses").get();
    list.innerHTML = "";
    snap.forEach(doc => { list.innerHTML += `<div style="background:#f1f5f9; padding:10px; border-radius:6px;"><strong>${doc.data().title}</strong> (रु. ${doc.data().offerPrice})</div>`; });
}

async function saveCourse() {
    const title = document.getElementById("crsTitle").value.trim();
    const key = document.getElementById("crsKey").value.trim().toLowerCase();
    const offerPrice = parseInt(document.getElementById("crsPrice").value);
    if(!title || !key || isNaN(offerPrice)) return;
    await db.collection("site_courses").doc(key).set({ title, offerPrice }, { merge: true });
    alert("✅ कोर्स सेभ भयो!"); loadCourses();
}

async function loadCourseDropdown() {
    const sel = document.getElementById("lessonCourseSelect");
    const snap = await db.collection("site_courses").get();
    sel.innerHTML = "";
    snap.forEach(doc => { sel.innerHTML += `<option value="${doc.id}">${doc.data().title}</option>`; });
}

async function uploadLesson() {
    const courseKey = document.getElementById("lessonCourseSelect").value;
    const order = parseInt(document.getElementById("lessonOrder").value) || 1;
    const title = document.getElementById("lessonTitle").value.trim();
    const vid = document.getElementById("lessonUrl").value.trim();
    const desc = document.getElementById("lessonDesc").value.trim();
    if(!title || !vid) { alert("शीर्षक र भिडियो लिङ्क राख्नुहोस्!"); return; }
    await db.collection("courses").doc(courseKey).collection("lessons").add({ order, title, vid, desc });
    alert("✅ लेसन अपलोड भयो!");
}

async function loadQr() {
    const doc = await db.collection("settings").doc("payment_qr").get();
    if(doc.exists && doc.data().imageUrl) { document.getElementById("qrPreview").src = doc.data().imageUrl; }
}

async function saveQrCode() {
    const file = document.getElementById("qrFileInput").files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        const imgData = e.target.result;
        await db.collection("settings").doc("payment_qr").set({ imageUrl: imgData });
        document.getElementById("qrPreview").src = imgData; alert("✅ QR सुरक्षित भयो!");
    };
    reader.readAsDataURL(file);
}

async function updateNotice(show) {
    const noticeText = document.getElementById("noticeText").value.trim();
    await db.collection("settings").doc("main").set({ showNotice: show, noticeText }, { merge: true });
    alert("✅ नोटिस अपडेट भयो!");
}
