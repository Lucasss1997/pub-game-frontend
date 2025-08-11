import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const API = process.env.REACT_APP_API_BASE || "https://pub-game-backend.onrender.com";
export default function LoginPage(){
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e)=>{
    e.preventDefault();
    setError(""); setLoading(true);
    try{
      const res = await fetch(API + "/api/login", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json().catch(async()=>({ error: await res.text() }));
      if(!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    }catch(err){ setError(err.message || "Login failed"); localStorage.removeItem("token"); }
    finally{ setLoading(false); }
  };
  return (<div style={{padding:24}}>
    <h2>Login</h2>
    {error && <p style={{color:"red"}}>{error}</p>}
    <form onSubmit={submit}>
      <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/>
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/>
      <button disabled={loading}>{loading?"Signing in…":"Login"}</button>
    </form>
  </div>);
}