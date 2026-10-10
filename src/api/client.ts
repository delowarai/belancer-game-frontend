export async function api<T = any>(path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch('/api' + path, {credentials:'same-origin', headers:{'Content-Type':'application/json','X-Requested-With':'Belancer'}, ...(body === undefined ? {} : {method:'POST',body:JSON.stringify(body)})});
  } catch {
    throw new Error('Cannot connect. Check that the frontend and backend servers are running.');
  }
  const raw = await res.text();
  let data: any;
  try { data = JSON.parse(raw); }
  catch {
    if (res.status >= 500) throw new Error('Backend unavailable. Check the PyCharm server on port 8000 and its terminal errors.');
    if (!res.ok) throw new Error(`Request failed (${res.status}). Check the backend terminal.`);
    throw new Error('The server returned an unexpected response. Check the API proxy configuration.');
  }
  if (!res.ok) {
    const detail = data.detail;
    if (typeof detail === 'string') throw new Error(detail);
    if (Array.isArray(detail) && detail.length) {
      throw new Error(detail.map((item:any) => `${(item.loc || []).filter((x:string) => x !== 'body').join(' · ')}: ${item.msg || 'Invalid value'}`).join('; '));
    }
    throw new Error('Please check your input');
  }
  return data;
}
