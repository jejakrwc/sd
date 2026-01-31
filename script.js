const HARGA_BUKU = 13500;
let rowEdit = null;

/* =========================
   NOMOR URUT
========================= */
function updateNomor() {
    const rows = document.querySelectorAll("#data tr");
    let no = 1;
    rows.forEach(row => {
        if (row.offsetParent !== null) {
            row.children[0].textContent = no++;
        }
    });
}
function resetBayar() {
    const rows = document.querySelectorAll("#data tr");
    rows.forEach(row => {
        const bayarInput = row.querySelector(".bayar");
        if (bayarInput) {
            bayarInput.value = 0;       // reset bayar ke 0
            hitung(row);                // hitung ulang total, sisa, status
        }
    });
    alert("Semua pembayaran telah di-reset!");
}
/* =========================
   UPDATE SALDO SEKARANG
========================= */
function updateSaldoSekarang() {
    let totalBayar = 0;
    document.querySelectorAll("#data tr").forEach(row => {
        const bayar = parseInt(row.querySelector(".bayar").value) || 0;
        totalBayar += bayar;
    });
    document.getElementById("saldoSekarang").textContent = totalBayar.toLocaleString("id-ID");
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
            status: row.querySelector(".status").innerText
        });
    });
    localStorage.setItem("dataSiswa", JSON.stringify(data));
}

function loadDariLocal() {
    let data = JSON.parse(localStorage.getItem("dataSiswa"));
    if (!data) return;

    const tbody = document.getElementById("data");
    tbody.innerHTML = "";

    data.forEach((item, i) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${i + 1}</td>
            <td><span class="nama-siswa">${item.nama}</span></td>

            ${item.buku.map(b => `
                <td><input type="checkbox" class="buku" ${b ? "checked" : ""}></td>
            `).join("")}

            <td><input type="text" class="form-control total" value="${item.total}" readonly></td>
            <td><input type="number" class="form-control bayar" value="${item.dibayar}"></td>
            <td><input type="text" class="form-control sisa" value="${item.sisa}" readonly></td>
            <td>
                <span class="badge status ${item.status === "LUNAS" ? "badge-lunas" : "badge-belum"}">
                    ${item.status}
                </span>
            </td>
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
   HITUNG
========================= */
function hitung(row) {
    let jumlah = 0;
    row.querySelectorAll(".buku").forEach(cb => cb.checked && jumlah++);

    const total = jumlah * HARGA_BUKU;
    const bayar = parseInt(row.querySelector(".bayar").value) || 0;
    const sisa = total - bayar;

    row.querySelector(".total").value = total.toLocaleString("id-ID");
    row.querySelector(".sisa").value = sisa > 0 ? sisa.toLocaleString("id-ID") : "0";

    const status = row.querySelector(".status");
    if (bayar >= total && total > 0) {
        status.textContent = "LUNAS";
        status.classList.replace("badge-belum", "badge-lunas");
    } else {
        status.textContent = "BELUM LUNAS";
        status.classList.replace("badge-lunas", "badge-belum");
    }

    simpanKeLocal();

    // Update saldo setelah hitung
    updateSaldoSekarang();
}
function updateSaldo() {
    const btnText = document.getElementById("btnUpdateSaldoText");
    const spinner = document.getElementById("btnUpdateSaldoSpinner");
    const nominal = document.getElementById("btnUpdateSaldoNominal");

    // tampilkan loading
    btnText.textContent = "LOADING DATA...";
    spinner.classList.remove("d-none");
    nominal.textContent = "";

    // simulasi loading 1 detik
    setTimeout(() => {
        let totalBayar = 0;
        document.querySelectorAll("#data tr").forEach(row => {
            const bayar = parseInt(row.querySelector(".bayar").value) || 0;
            totalBayar += bayar;
        });

        // selesai loading
        btnText.textContent = "SALDO";
        spinner.classList.add("d-none");
        nominal.textContent = `Rp ${totalBayar.toLocaleString("id-ID")}`;
    }, 1000);
}

// pasang event klik tombol
document.getElementById("btnUpdateSaldo").addEventListener("click", updateSaldo);


// event klik tombol
document.getElementById("btnUpdateSaldo").addEventListener("click", updateSaldo);


/* =========================
   EVENT
========================= */
document.addEventListener("change", e => {
    if (e.target.classList.contains("buku")) {
        hitung(e.target.closest("tr"));
    }
});

document.addEventListener("input", e => {
    if (e.target.classList.contains("bayar")) {
        hitung(e.target.closest("tr"));
    }
});

/* =========================
   EDIT NAMA
========================= */
function openEditModal(btn) {
    rowEdit = btn.closest("tr");
    document.getElementById("editNamaInput").value =
        rowEdit.querySelector(".nama-siswa").textContent;
    new bootstrap.Modal(editModal).show();
}

function simpanNama() {
    if (!rowEdit) return;
    const nama = editNamaInput.value.trim();
    if (nama) rowEdit.querySelector(".nama-siswa").textContent = nama;
    simpanKeLocal();
    bootstrap.Modal.getInstance(editModal).hide();
}

/* =========================
   TAMBAH & HAPUS
========================= */
function tambahBaris() {
    const tbody = document.getElementById("data");
    const row = tbody.insertRow();
    row.innerHTML = `
        <td></td>
        <td><span class="nama-siswa">Nama Siswa</span></td>
        ${'<td><input type="checkbox" class="buku"></td>'.repeat(9)}
        <td><input type="text" class="form-control total" readonly></td>
        <td><input type="number" class="form-control bayar" value="0"></td>
        <td><input type="text" class="form-control sisa" readonly></td>
        <td><span class="badge status badge-belum">BELUM LUNAS</span></td>
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
    updateNomor();
    simpanKeLocal();
}

function hapusRow(btn) {
    if (confirm("Hapus data siswa ini?")) {
        btn.closest("tr").remove();
        updateNomor();
        simpanKeLocal();
    }
}

/* =========================
   TAMBAH SISWA
========================= */
function simpanSiswa() {
    const nama = tambahNamaInput.value.trim();
    if (!nama) return alert("Nama siswa wajib diisi");

    tambahBaris();
    document.querySelector("#data tr:last-child .nama-siswa").textContent = nama;
    simpanKeLocal();
    bootstrap.Modal.getInstance(tambahModal).hide();
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
    const key = searchInput.value.toLowerCase();
    let found = false;

    document.querySelectorAll("#data tr").forEach(row => {
        const match = row.querySelector(".nama-siswa").innerText.toLowerCase().includes(key);
        row.style.display = match ? "" : "none";
        if (match) found = true;
    });

    noResult.classList.toggle("d-none", found || key === "");
}
function openTambahModal() {
    document.getElementById("tambahNamaInput").value = "";
    new bootstrap.Modal(document.getElementById("tambahModal")).show();
}
/* =========================
   EXPORT DATA
========================= */
function exportData() {
    const data = JSON.parse(localStorage.getItem("dataSiswa")) || [];
    if (data.length === 0) return alert("Tidak ada data untuk diexport");

    const jsonContent = JSON.stringify(data, null, 2); // format rapi

    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "data_siswa.json";
    a.click();

    URL.revokeObjectURL(url);
}


/* =========================
   IMPORT DATA
========================= */
function importData() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";

    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                if (!Array.isArray(data)) throw new Error("Format file tidak valid");

                localStorage.setItem("dataSiswa", JSON.stringify(data));
                loadDariLocal();
                alert("Data berhasil diimport");
            } catch (err) {
                alert("Gagal mengimport data: " + err.message);
            }
        };
        reader.readAsText(file);
    };

    input.click();
}


/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
    loadDariLocal();
});
document.addEventListener("DOMContentLoaded", () => {

    const syaratModal = document.getElementById("syaratModal");
    const btnSetuju = document.getElementById("btnSetujuSyarat");

    // Nonaktifkan semua tombol dan input sebelum setuju
    const semuaElemen = document.querySelectorAll("button, input, select, textarea");
    semuaElemen.forEach(el => el.disabled = true);

    // Aktifkan tombol "Setuju"
    btnSetuju.disabled = false;

    // Event klik setuju
    btnSetuju.addEventListener("click", () => {
        // sembunyikan modal
        syaratModal.style.display = "none";
        syaratModal.classList.remove("show");

        // aktifkan kembali semua tombol dan input
        semuaElemen.forEach(el => el.disabled = false);

        // load data siswa
        loadDariLocal();
    });

    // Jangan gunakan localStorage/sessionStorage → modal muncul tiap refresh
});
