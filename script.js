const HARGA_BUKU = 13500;
let rowEdit = null;
let rowToDelete = null;

/* =========================
   NOMOR URUT
========================= */
function updateNomor() {
    const rows = document.querySelectorAll("#data tr");
    rows.forEach((row, i) => row.children[0].textContent = i + 1);
}

/* =========================
   HITUNG TOTAL, SISA, STATUS
========================= */
function hitung(row) {
    // Hitung total berdasarkan checkbox buku
    let jumlah = 0;
    row.querySelectorAll(".buku").forEach(cb => cb.checked && jumlah++);
    const total = jumlah * HARGA_BUKU;

    // Ambil bayar dari input
    let bayar = parseInt(row.querySelector(".bayar").value) || 0;

    // Hitung selisih
    let selisih = bayar - total; 
    const statusEl = row.querySelector(".status");
    const sisaEl = row.querySelector(".sisa");

    if (selisih < 0) {
        // Kurang bayar
        statusEl.textContent = "BELUM LUNAS";
        statusEl.classList.replace("badge-lunas", "badge-belum");
        sisaEl.value = `Kurang Rp ${Math.abs(selisih).toLocaleString("id-ID")}`;
    } else if (selisih > 0) {
        // Lebih bayar
        statusEl.textContent = "LUNAS";
        statusEl.classList.replace("badge-belum", "badge-lunas");
        sisaEl.value = `Lebih Rp ${selisih.toLocaleString("id-ID")}`;
    } else {
        // Lunas tepat
        statusEl.textContent = "LUNAS";
        statusEl.classList.replace("badge-belum", "badge-lunas");
        sisaEl.value = "0";
    }

    // Update total
    row.querySelector(".total").value = total.toLocaleString("id-ID");

    // Simpan ke localStorage
    simpanKeLocal();

    // Update total saldo dibayar
    updateSaldoSekarang();
}



/* =========================
   LOCAL STORAGE
========================= */
function simpanKeLocal() {
    let data = [];
    document.querySelectorAll("#data tr").forEach(row => {
        data.push({
            nama: row.querySelector(".nama-siswa").innerText,
            buku: [...row.querySelectorAll(".buku")].map(b => b.checked),
            total: row.querySelector(".total").value,
            dibayar: row.querySelector(".bayar").value,
            sisa: row.querySelector(".sisa").value,
            status: row.querySelector(".status").textContent
        });
    });
    localStorage.setItem("dataSiswa", JSON.stringify(data));
}

function loadDariLocal() {
    const data = JSON.parse(localStorage.getItem("dataSiswa")) || [];
    const tbody = document.getElementById("data");
    tbody.innerHTML = "";
    data.forEach((item, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${i+1}</td>
            <td><span class="nama-siswa">${item.nama}</span></td>
            ${item.buku.map(b => `<td><input type="checkbox" class="buku" ${b ? "checked" : ""}></td>`).join('')}
            <td><input type="text" class="form-control total" value="${item.total}" readonly></td>
            <td><input type="number" class="form-control bayar" value="${item.dibayar}"></td>
            <td><input type="text" class="form-control sisa" value="${item.sisa}" readonly></td>
            <td><span class="badge status ${item.status === "LUNAS" ? "badge-lunas" : "badge-belum"}">${item.status}</span></td>
            <td class="aksi">
                <button class="btn btn-warning btn-sm" onclick="openEditModal(this)">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="hapusRow(this)">
                    <i class="fa-solid fa-trash"></i>
                </button>
                <button class="btn btn-success btn-sm" onclick="kirimWA(this)">
                    <i class="fa-brands fa-whatsapp"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    updateNomor();
}

/* =========================
   TAMBAH SISWA
========================= */
function openTambahModal() {
    document.getElementById("tambahNamaInput").value = "";
    new bootstrap.Modal(document.getElementById("tambahModal")).show();
}

function simpanSiswa() {
    const namaInput = document.getElementById("tambahNamaInput");
    const nama = namaInput.value.trim();
    if (!nama) return;

    const tbody = document.getElementById("data");
    const row = document.createElement("tr");
    row.innerHTML = `
        <td></td>
        <td><span class="nama-siswa">${nama}</span></td>
        ${'<td><input type="checkbox" class="buku"></td>'.repeat(9)}
        <td><input type="text" class="form-control total" readonly></td>
        <td><input type="number" class="form-control bayar" value="0"></td>
        <td><input type="text" class="form-control sisa" readonly></td>
        <td><span class="badge status badge-belum">BELUM LUNAS</span></td>
        <td class="aksi">
            <button class="btn btn-warning btn-sm" onclick="openEditModal(this)"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn btn-danger btn-sm" onclick="hapusRow(this)"><i class="fa-solid fa-trash"></i></button>
            <button class="btn btn-success btn-sm" onclick="kirimWA(this)"><i class="fa-brands fa-whatsapp"></i></button>
        </td>
    `;
    tbody.appendChild(row);
    updateNomor();
    simpanKeLocal();

    bootstrap.Modal.getInstance(document.getElementById("tambahModal")).hide();
    const toastBody = document.getElementById("tambahToastBody");
    toastBody.innerHTML = `<i class="fa-solid fa-circle-check me-2"></i> Data siswa <strong>${nama}</strong> berhasil ditambahkan.`;
    new bootstrap.Toast(document.getElementById("tambahToast"), { delay: 3000 }).show();
}

/* =========================
   HAPUS ROW / SEMUA
========================= */
function hapusRow(button) {
    rowToDelete = button.closest("tr");
    new bootstrap.Modal(document.getElementById("hapusModal")).show();
}
document.getElementById("confirmHapusBtn").addEventListener("click", () => {
    if (rowToDelete) {
        rowToDelete.remove();
        rowToDelete = null;
        bootstrap.Modal.getInstance(document.getElementById("hapusModal")).hide();
        new bootstrap.Toast(document.getElementById("hapusToast"), { delay: 3000 }).show();
        simpanKeLocal();
        updateNomor();
    }
});
// Tampilkan modal saat tombol diklik
function openHapusSemuaModal() {
    const hapusModal = new bootstrap.Modal(document.getElementById('hapusSemuaModal'));
    hapusModal.show();
}

// Tombol Hapus Semua di modal
document.getElementById('confirmHapusSemuaBtn').addEventListener('click', function() {
    // Hapus semua data
    document.getElementById("data").innerHTML = "";
    localStorage.removeItem("dataSiswa");
    updateNomor();
    updateSaldoSekarang();

    // Tutup modal
    const hapusModalEl = document.getElementById('hapusSemuaModal');
    bootstrap.Modal.getInstance(hapusModalEl).hide();

    // Tampilkan toast
    const toastEl = document.getElementById("hapusSemuaToast"); // pastikan ada toast HTML
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
});


/* =========================
   RESET BAYAR
========================= */
function resetBayar() {
    document.querySelectorAll("#data tr").forEach(row => {
        const bayarInput = row.querySelector(".bayar");
        if (bayarInput) {
            bayarInput.value = 0;
            hitung(row);
        }
    });
}
function exportData() {
    const rows = document.querySelectorAll("#data tr");
    if (rows.length === 0) {
        alert("Tidak ada data untuk diexport!");
        return;
    }

    const dataArray = Array.from(rows).map(row => {
        const nama = row.querySelector(".nama-siswa").textContent;
        const buku = Array.from(row.querySelectorAll(".buku")).map(cb => cb.checked);
        const total = parseInt(row.querySelector(".total").value.replace(/\./g, "")) || 0;
        const bayar = parseInt(row.querySelector(".bayar").value) || 0;
        const sisa = parseInt(row.querySelector(".sisa").value.replace(/\./g, "")) || 0;
        const status = row.querySelector(".status").textContent;

        return { nama, buku, total, bayar, sisa, status };
    });

    const blob = new Blob([JSON.stringify(dataArray, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data_siswa.json";
    a.click();
    URL.revokeObjectURL(url);
}
function importData() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = event => {
            try {
                const dataArray = JSON.parse(event.target.result);
                const tbody = document.getElementById("data");
                tbody.innerHTML = ""; // Kosongkan tabel dulu

                dataArray.forEach(item => {
                    const row = document.createElement("tr");

                    let checkboxes = item.buku.map(checked => `<td><input type="checkbox" class="buku" ${checked ? "checked" : ""}></td>`).join("");

                    row.innerHTML = `
                        <td></td>
                        <td><span class="nama-siswa">${item.nama}</span></td>
                        ${checkboxes}
                        <td><input type="text" class="form-control total" readonly value="${item.total}"></td>
                        <td><input type="number" class="form-control bayar" value="${item.bayar}"></td>
                        <td><input type="text" class="form-control sisa" readonly value="${item.sisa}"></td>
                        <td><span class="badge status ${item.status === "LUNAS" ? "badge-lunas" : "badge-belum"}">${item.status}</span></td>
                        <td class="aksi">
                            <button class="btn btn-warning btn-sm" onclick="openEditModal(this)">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="hapusRow(this)">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                            <button class="btn btn-success btn-sm" onclick="kirimWA(this)">
                                <i class="fa-brands fa-whatsapp"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);

                    // Hitung ulang total, sisa, status
                    hitung(row);
                });

                updateNomor();
                simpanKeLocal();

                // Toast konfirmasi
                const toastBody = document.getElementById("tambahToastBody");
                toastBody.innerHTML = `<i class="fa-solid fa-circle-check me-2"></i> Data berhasil diimport.`;
                new bootstrap.Toast(document.getElementById("tambahToast"), { delay: 3000 }).show();
            } catch (err) {
                alert("File JSON tidak valid!");
            }
        };
        reader.readAsText(file);
    };
    input.click();
}
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape', 'mm', 'a4'); // Landscape A4

    const table = document.getElementById("data").closest("table");

    // Ambil header, kecuali kolom AKSI
    const headers = [];
    table.querySelectorAll("thead tr th").forEach(th => {
        if (th.innerText.trim() !== "AKSI") {
            headers.push(th.innerText.trim());
        }
    });

    let totalDibayar = 0;

    // Ambil data, kecuali kolom AKSI
    const data = [];
    table.querySelectorAll("tbody tr").forEach(tr => {
        const rowData = [];
        tr.querySelectorAll("td").forEach(td => {
            if (td.classList.contains("aksi")) return; // skip kolom AKSI

            const input = td.querySelector("input");
            if (input && input.type === "checkbox") {
                // Checkbox dicentang -> tampil "-"
                // Checkbox tidak dicentang -> kosong
                rowData.push(input.checked ? "-" : "");
            } else if (td.querySelector(".status")) {
                rowData.push(td.querySelector(".status").innerText);
            } else if (input) {
                const val = input.value;
                rowData.push(val);
                if (input.classList.contains("bayar")) {
                    totalDibayar += parseInt(val) || 0;
                }
            } else {
                rowData.push(td.innerText);
            }
        });
        data.push(rowData);
    });

    const indexBayar = headers.findIndex(h => h.toUpperCase() === "DIBAYAR");
    const indexNama = headers.findIndex(h => h.toUpperCase() === "NAMA SISWA");

    // Baris SALDO SEKARANG
    const saldoRow = new Array(headers.length).fill('');
    if (indexNama !== -1) saldoRow[indexNama] = "SALDO SEKARANG";
    if (indexBayar !== -1) saldoRow[indexBayar] = totalDibayar.toLocaleString("id-ID");
    data.push(saldoRow);

    // Header judul & tanggal
    const tanggal = new Date().toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' });
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("REKAP PEMBAYARAN BUKU", doc.internal.pageSize.getWidth() / 2, 10, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Tanggal: ${tanggal}`, doc.internal.pageSize.getWidth() / 2, 18, { align: 'center' });

    // AutoTable
    doc.autoTable({
        head: [headers],
        body: data,
        startY: 25,
        theme: 'grid',
        styles: {
            fontSize: 7,        // kecilkan font agar muat
            cellPadding: 1,
            overflow: 'linebreak'
        },
        headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { halign: 'center' }, // NO
            2: { halign: 'center' }, // B.ING
            3: { halign: 'center' }, // B.IND
            4: { halign: 'center' }, // PJOK
            5: { halign: 'center' }, // MTK
            6: { halign: 'center' }, // SENI
            7: { halign: 'center' }, // IPAS
            8: { halign: 'center' }, // BUKU G
            9: { halign: 'center' }, // BUKU H
            10: { halign: 'center' }, // BUKU I
            14: { halign: 'center' }  // STATUS
        },
        tableWidth: 'auto',
        pageBreak: 'avoid'
    });

    doc.save("Rekap_Pembayaran_Buku.pdf");
}

/* =========================
   EVENT CHECKBOX / BAYAR
========================= */
document.addEventListener("change", e => { if (e.target.classList.contains("buku")) hitung(e.target.closest("tr")); });
document.addEventListener("input", e => { if (e.target.classList.contains("bayar")) hitung(e.target.closest("tr")); });

/* =========================
   EDIT NAMA
========================= */
function openEditModal(button) {
    rowEdit = button.closest("tr");
    document.getElementById("editNamaInput").value = rowEdit.querySelector(".nama-siswa").textContent;
    new bootstrap.Modal(document.getElementById("editModal")).show();
}
function simpanNama() {
    const input = document.getElementById("editNamaInput");
    const newName = input.value.trim();
    if (!newName || !rowEdit) return;
    rowEdit.querySelector(".nama-siswa").textContent = newName;
    bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
    const toastBody = document.getElementById("editToastBody");
    toastBody.innerHTML = `<i class="fa-solid fa-circle-check me-2"></i> Data siswa <strong>${newName}</strong> berhasil diperbarui.`;
    new bootstrap.Toast(document.getElementById("editToast"), { delay: 3000 }).show();
    rowEdit = null;
    simpanKeLocal();
}

/* =========================
   WHATSAPP
========================= */
function kirimWA(btn) {
    const row = btn.closest("tr");
    const pesan = `Halo,
Pembayaran buku siswa
Nama: ${row.querySelector(".nama-siswa").textContent}
Total: Rp ${row.querySelector(".total").value}
Sisa: Rp ${row.querySelector(".sisa").value}
Status: ${row.querySelector(".status").textContent}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(pesan)}`);
}

/* =========================
   SEARCH
========================= */
function cariSiswa() {
    const key = document.getElementById("searchInput").value.toLowerCase();
    let found = false;
    document.querySelectorAll("#data tr").forEach(row => {
        const nama = row.querySelector(".nama-siswa").textContent.toLowerCase();
        if (nama.includes(key)) {
            row.style.display = "";
            found = true;
        } else row.style.display = "none";
    });
    document.getElementById("noResult").classList.toggle("d-none", found);
}

/* =========================
   SALDO (opsional)
========================= */
function updateSaldoSekarang() {
    // jumlahkan semua input bayar
    const totalBayar = [...document.querySelectorAll("#data .bayar")].reduce((a, b) => {
        const val = parseInt(b.value) || 0;
        return a + val;
    }, 0);

    document.getElementById("btnUpdateSaldoNominal").textContent = `Rp ${totalBayar.toLocaleString("id-ID")}`;
}


/* =========================
   INIT
========================= */
loadDariLocal();
