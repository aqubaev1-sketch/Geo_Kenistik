"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="kk"><body><main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:"24px",fontFamily:"sans-serif"}}><section style={{maxWidth:520,textAlign:"center"}}><h1>GeoKenistik уақытша қолжетімсіз</h1><p>Қолданбаны қайта жүктеп көріңіз.</p><button onClick={reset} style={{marginTop:16,padding:"12px 20px",border:0,borderRadius:12,background:"#4f46e5",color:"white",fontWeight:700}}>Қайта жүктеу</button></section></main></body></html>;
}
