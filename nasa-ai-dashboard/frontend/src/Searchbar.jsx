import React, {useState} from "react";
export default function SearchBar({onSearch}) {
  const [q, setQ] = useState("");
  function submit(e){
    e.preventDefault();
    onSearch(q);
  }
  return (
    <form onSubmit={submit} style={{marginBottom:12}}>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." style={{width:"60%", padding:8}} />
      <button type="submit" style={{marginLeft:8}}>Search</button>
    </form>
  );
}

