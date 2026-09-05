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
