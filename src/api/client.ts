export async function api<T = any>(path: string, body?: unknown): Promise<T> {
  const res = await fetch('/api' + path, {credentials:'same-origin', headers:{'Content-Type':'application/json','X-Requested-With':'Belancer'}, ...(body === undefined ? {} : {method:'POST',body:JSON.stringify(body)})});
  const data = await res.json().catch(() => ({detail:'Connection failed'}));
  if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Please check your input');
  return data;
}
