"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { resources } from "@/lib/resources";
export default function ResourceManager({
  resource,
  rows,
  options,
  role,
}: {
  resource: string;
  rows: any[];
  options: Record<string, any[]>;
  role: string;
}) {
  const spec = resources[resource],
    router = useRouter();
  const [editing, setEditing] = useState<any>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const canCreate = !spec.readOnly && resource !== "comments";
  async function mutate(method: string, data: any) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/resources/${resource}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const r = await res.json();
      setMessage(r.error || r.message || "रिकॉर्ड हट गया।");
      if (res.ok) {
        setEditing(null);
        router.refresh();
      }
    } catch {
      setMessage("कनेक्शन नहीं हो पाया।");
    } finally {
      setBusy(false);
    }
  }
  const columns = rows.length
    ? Object.keys(rows[0]).filter(
        (k) => !["passwordHash", "password", "userId", "articleId"].includes(k),
      )
    : [];
  return (
    <>
      <div className="admin-title">
        <h1>{spec.title}</h1>
        {canCreate && (
          <button
            className="button"
            onClick={() => {
              setEditing(
                resource === "users" ? { role: "AUTHOR", active: true } : {},
              );
              setMessage("");
            }}
          >
            ＋ नया जोड़ें
          </button>
        )}
      </div>
      <p className="form-message" role="status">
        {message}
      </p>
      {editing && (
        <form
          className="panel resource-editor"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const data: any = {
              ...Object.fromEntries(form),
              id: editing.id || form.get("id") || undefined,
            };
            for (const f of spec.fields) {
              if (f.type === "checkbox") data[f.key] = form.has(f.key);
              if (f.type === "datetime-local" && data[f.key])
                data[f.key] = new Date(data[f.key]).toISOString();
            }
            mutate("POST", data);
          }}
        >
          <h2>{editing.id ? "संपादित करें" : "नया रिकॉर्ड"}</h2>
          <div className="form-grid">
            {spec.fields.map((f) => (
              <label
                className={f.type === "checkbox" ? "check-label" : ""}
                key={f.key}
              >
                {f.label}
                {f.type === "textarea" ? (
                  <textarea
                    name={f.key}
                    defaultValue={editing[f.key] || ""}
                    rows={6}
                    required={f.required}
                  />
                ) : f.relation || f.type === "select" ? (
                  <select
                    name={f.key}
                    defaultValue={editing[f.key] || ""}
                    required={f.required}
                    disabled={f.key === "id" && !!editing.id}
                  >
                    {!f.required && <option value="">कोई नहीं</option>}
                    {f.relation
                      ? (options[f.relation] || []).map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name || o.email}
                          </option>
                        ))
                      : f.options
                          ?.filter(
                            (o) =>
                              resource !== "users" ||
                              role === "SUPER_ADMIN" ||
                              o !== "SUPER_ADMIN",
                          )
                          .map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : f.type === "checkbox" ? (
                  <input
                    name={f.key}
                    type="checkbox"
                    defaultChecked={
                      editing[f.key] ??
                      (resource === "users" && f.key === "active")
                    }
                  />
                ) : (
                  <input
                    name={f.key}
                    type={f.type || "text"}
                    defaultValue={
                      f.type === "datetime-local" && editing[f.key]
                        ? new Date(
                            new Date(editing[f.key]).getTime() -
                              new Date(editing[f.key]).getTimezoneOffset() *
                                60000,
                          )
                            .toISOString()
                            .slice(0, 16)
                        : f.type === "password"
                          ? ""
                          : (editing[f.key] ?? "")
                    }
                    required={f.required}
                    autoComplete={
                      f.type === "password" ? "new-password" : undefined
                    }
                  />
                )}
              </label>
            ))}
          </div>
          <div className="button-row">
            <button className="button" disabled={busy}>
              सुरक्षित करें
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={() => setEditing(null)}
            >
              रद्द करें
            </button>
          </div>
        </form>
      )}
      <div className="panel table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c}>
                  {spec.fields.find((f) => f.key === c)?.label || c}
                </th>
              ))}
              {!spec.readOnly && <th>कार्रवाई</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((c) => (
                  <td key={c}>
                    {typeof row[c] === "boolean"
                      ? row[c]
                        ? "हाँ"
                        : "नहीं"
                      : String(row[c] ?? "—").slice(0, 300)}
                  </td>
                ))}
                {!spec.readOnly && (
                  <td>
                    <button
                      onClick={() => {
                        setEditing(row);
                        setMessage("");
                      }}
                    >
                      संपादित करें
                    </button>
                    <button
                      className="danger-link"
                      disabled={busy}
                      onClick={() => {
                        if (confirm("यह रिकॉर्ड स्थायी रूप से हटाएँ?"))
                          mutate("DELETE", { id: row.id });
                      }}
                    >
                      हटाएँ
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="empty">अभी कोई रिकॉर्ड नहीं है।</p>}
      </div>
    </>
  );
}
