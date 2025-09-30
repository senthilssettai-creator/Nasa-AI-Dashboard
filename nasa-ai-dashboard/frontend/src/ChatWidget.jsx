import React, {useState} from "react";
import axios from "axios";
export default function ChatWidget({apiBase}) {
  const [q, setQ] = useState("");
  const [resp, setResp] = useState(null);
  async function ask(){
    try{
      const r = await axios.post((apiBase||"http://localhost:8000") + "/chat", { query: q, context_item_ids: []});
      setResp(r.data);
    }catch(e){
      alert("Chat failed");
    }
  }
  return (
    <div style={{position:"fixed", right:20, bottom:20, width:320, background:"#fff", border:"1px solid #ddd", padding:12}}>
      <h4>Chat</h4>
      <textarea value={q} onChange={e=>setQ(e.target.value)} style={{width:"100%", height:80}} />
      <div style={{marginTop:8}}>
        <button onClick={ask}>Ask</button>
      </div>
      {resp && <div style={{marginTop:8, maxHeight:240, overflow:"auto"}}><pre>{JSON.stringify(resp, null, 2)}</pre></div>}
    </div>
  );
}

