import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = (process.env.REACT_APP_API_BASE || "").replace(/\/$/,"");

export default function DashboardPage(){
  const navigate = useNavigate();
  const [msg, setMsg] = useState("Loading…");
  const [pub, setPub] = useState(null);

  useEffect(()=>{
    const token = localStorage.getItem("token");
    if (!token){ navigate("/login"); return; }
    (async ()=>{
      try{
        const r = await fetch(`${API}/api/dashboard`, { headers: { Authorization: "Bearer " + token } });
        const d = await r.json().catch(async()=>({ error: await r.text() }));
        if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
        setPub((d.pubs || [])[0] || null);
        setMsg("");
      }catch(e){
        setMsg("Failed to load dashboard: " + e.message);
      }
    })();
  },[navigate]);

  const logout = ()=>{ localStorage.removeItem("token"); navigate("/login"); };

  return (
    <div style={{minHeight:"100vh",padding:24}}>
      <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h1>Pub Dashboard</h1>
        <button onClick={logout}>Logout</button>
      </header>
      {msg && <p>{msg}</p>}
      {pub && (
        <div style={{background:"#fff",padding:16,borderRadius:12,boxShadow:"0 8px 30px rgba(0,0,0,.08)"}}>
          <h3>{pub.name}</h3>
          <p style={{color:"#6b7280"}}>{[pub.city, pub.address].filter(Boolean).join(" · ") || "—"}</p>
        </div>
      )}
    </div>
  );
}
