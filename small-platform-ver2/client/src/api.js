const API = (function(){
  const BASE = process.env.REACT_APP_API || 'http://localhost:4000';

  async function post(path, body){
    const res = await fetch(BASE + path, {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)
    });
    return res.json();
  }

  async function get(path, token){
    const res = await fetch(BASE + path, { headers: token ? { 'Authorization': 'Bearer ' + token } : {} });
    if (res.headers.get('content-type') && res.headers.get('content-type').includes('application/json')) return res.json();
    // for downloads, return response
    return res;
  }

  return { post, get };
})();

export default API;
