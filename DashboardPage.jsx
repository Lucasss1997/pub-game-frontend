import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const API = process.env.REACT_APP_API_BASE || "https://pub-game-backend.onrender.com";
export default function DashboardPage(){
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  useEffect(()=>{
    const token = localStorage.getItem("token");
    if(!token){ navigate("/login"); return; }
    (async()=>{
      try{
        const r = await fetch(API + "/api/dashboard", { headers: { Authorization: "Bearer " + token }});
        const d = await r.json().catch(async()=>({error: await r.text()}));
        if(!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
        setMsg("Dashboard loaded");
      }catch(e){ setMsg("Failed: " + e.message); }
    })();
  },[navigate]);
  return (<div style={{padding:24}}><h2>Dashboard</h2><p>{msg}</p></div>);
}