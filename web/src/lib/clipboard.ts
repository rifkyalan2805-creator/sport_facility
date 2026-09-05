/**
 * Menyalin teks ke papan klip.
 *
 * Jalur utamanya Async Clipboard API. Jalur cadangan `execCommand` tetap
 * dipertahankan karena API modern itu hanya tersedia pada konteks aman —
 * halaman yang dibuka lewat http biasa dari perangkat lain di jaringan lokal
 * (kebiasaan saat menguji di ponsel) tidak mendapatkannya, dan tanpa cadangan
 * tombol salin akan diam saja tanpa penjelasan.
 *
 * Mengembalikan `false` alih-alih melempar, supaya pemanggil bisa menampilkan
 * keadaan gagal tanpa membungkus tiap panggilan dengan try/catch.
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Izin ditolak atau dokumen tidak fokus — coba cara lama di bawah.
    }
  }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    // Di luar layar tapi tetap ter-render: elemen dengan `display:none`
    // tidak bisa diseleksi, sehingga penyalinannya gagal diam-diam.
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";

    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);

    return ok;
  } catch {
    return false;
  }
}
