import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = (process.env.REACT_APP_API_BASE || "").replace(/\/$/,"");

export default function LoginPage(){
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(""); setLoading(true);
    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(async()=>({ error: await res.text() }));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      localStorage.removeItem("token");
      setMsg(err.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <form onSubmit={submit} style={{background:"#fff",padding:24,borderRadius:12,width:360, boxShadow:"0 8px 30px rgba(0,0,0,.08)"}}>
        <h2 style={{marginTop:0}}>Pub Game Login</h2>
        {msg && <p style={{color:"crimson"}}>{msg}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
          style={{width:"100%",padding:10,margin:"8px 0",borderRadius:8,border:"1px solid #ddd"}}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
          style={{width:"100%",padding:10,margin:"8px 0",borderRadius:8,border:"1px solid #ddd"}}
        />
        <button disabled={loading} style={{width:"100%",padding:10,border:"none",borderRadius:8,background:"#2563eb",color:"#fff"}}>
          {loading ? "Signing in…" : "Login"}
        </button>
      </form>
    </div>
  );
}
