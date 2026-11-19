"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="kk">
      <body style={{ margin: 0, background: "#fff", color: "#0f172a", fontFamily: "Arial, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, boxSizing: "border-box" }}>
          <section style={{ width: "100%", maxWidth: 520, padding: "48px 28px", border: "1px solid #e0e7ff", borderRadius: 32, textAlign: "center", boxSizing: "border-box", boxShadow: "0 24px 70px rgba(15,23,42,.08)" }}>
            <div style={{ width: 64, height: 64, display: "grid", placeItems: "center", margin: "0 auto", borderRadius: 18, background: "#eef2ff", color: "#4f46e5", fontSize: 28, fontWeight: 800 }}>!</div>
            <h1 style={{ margin: "24px 0 0", fontSize: 32, lineHeight: 1.15 }}>GeoKenistik уақытша қолжетімсіз</h1>
            <p style={{ margin: "16px auto 0", maxWidth: 400, color: "#64748b", lineHeight: 1.7 }}>Қолданбаны қайта жүктеп көріңіз. Енгізілген деректеріңізді қайта тексеру қажет болуы мүмкін.</p>
            <button onClick={reset} style={{ marginTop: 28, minHeight: 48, padding: "12px 24px", border: 0, borderRadius: 16, background: "#4f46e5", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Қайта жүктеу</button>
          </section>
        </main>
      </body>
    </html>
  );
}
