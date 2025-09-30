import React, {useState, useEffect} from "react";
import axios from "axios";
import SearchBar from "./components/SearchBar";
import ResultsList from "./components/ResultsList";
import ChatWidget from "./components/ChatWidget";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export default function App(){
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(()=> { loadPage(1, ""); }, []);

  async function loadPage(p=1, query=""){
    try{
      const resp = await axios.post(`${API_BASE}/components`, {q: query, page: p, page_size: 20});
      const data = resp.data.items || [];
      if(p===1) setItems(data);
      else setItems(prev => [...prev, ...data]);
      setPage(p);
    } catch(err){
      console.error(err);
      alert("Failed to load items");
    }
  }

  function onSearch(newQ){
    setQ(newQ);
    loadPage(1, newQ);
  }
  function loadMore(){ loadPage(page+1, q); }
  function refresh(){ loadPage(1, q); }

  return (
    <div>
      <h1>SpaceBio Dashboard</h1>
      <SearchBar onSearch={onSearch} />
      <button onClick={refresh}>Refresh</button>
      <ResultsList items={items} />
      <div style={{textAlign:"center", marginTop:12}}>
        <button onClick={loadMore}>Load more</button>
      </div>
      <ChatWidget apiBase={API_BASE} />
    </div>
  );
}
