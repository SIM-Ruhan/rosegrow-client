export const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export async function api(path, { method = "GET", body, token } = {}) {
  const r = await fetch(API + path, {
    method,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "Request failed");
  return j;
}

export const fileToBase64 = (file) =>
  new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result).split(",")[1]);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });

export async function uploadImage(file, token) {
  const { url } = await api("/api/upload", { method: "POST", token, body: { image: await fileToBase64(file) } });
  return url;
}
