const API = import.meta.env.VITE_API_URL ?? "";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  created_at: string | null;
}

export async function submitContactMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/v1/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("nexus_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchAdminMessages(): Promise<{
  messages: ContactMessage[];
  total: number;
  new_count: number;
} | null> {
  try {
    const res = await fetch(`${API}/api/v1/admin/messages`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as {
      messages: ContactMessage[];
      total: number;
      new_count: number;
    };
  } catch {
    return null;
  }
}

export async function updateMessageStatus(
  id: string,
  status: ContactMessage["status"],
): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/v1/admin/messages/${id}`, {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
