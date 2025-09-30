import React, {useState} from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

function ItemCard({item}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  async function openItem(){
    if(detail) return;
    setLoading(true);
    try{
      const r = await axios.get(`${API_BASE}/item/${item.id}`);
      setDetail(r.data);
    }catch(e){
      alert("Failed to load item");
    }finally{ setLoading(false); }
  }
  return (
    <div style={{border:"1px solid #ddd", padding:12, marginBottom:8}}>
      <div style={{display:"flex"}}>
        <img src={item.thumbnail || "https://via.placeholder.com/120"} style={{width:120, height:80, objectFit:"cover", marginRight:12}} />
        <div style={{flex:1}}>
          <h3 style={{margin:0, cursor:"pointer"}} onClick={openItem}>{item.title}</h3>
          <p style={{margin:"6px 0"}}>{item.summary || "No summary"}</p>
          <small>Source: {item.source || "unknown"}</small>
        </div>
      </div>
      {loading && <div>Loading details...</div>}
      {detail && (
        <div style={{marginTop:10}}>
          <h4>Long Summary</h4>
          <p>{detail.ai_summary_long || detail.ai_summary_short || detail.abstract}</p>
          <h5>Entities</h5>
          <pre>{JSON.stringify(detail.extracted_entities, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default function ResultsList({items}) {
  return <div>{items.map(it => <ItemCard key={it.id} item={it} />)}</div>;
}
