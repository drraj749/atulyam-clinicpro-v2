"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Staff = {
  id: number;
  staffCode: string;
  name: string;
  role: string;
  mobile: string | null;
  address: string | null;
  joiningDate: string | null;
  isActive: boolean;
  username: string | null;
  loginEnabled: boolean;
  lastLoginAt: string | null;
};

type FormState = {
  name: string;
  role: string;
  mobile: string;
  address: string;
  joiningDate: string;
  username: string;
  loginEnabled: boolean;
  password: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  role: "Nurse",
  mobile: "",
  address: "",
  joiningDate: "",
  username: "",
  loginEnabled: true,
  password: "",
};

const ROLES = [
  "Admin",
  "Doctor",
  "Nurse",
  "Receptionist",
  "Lab Technician",
  "Pharmacist",
  "Accountant",
  "Housekeeping",
  "Other",
];

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | null) {
  if (!value) return "Never";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StaffAdminPage() {
  const router = useRouter();

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [resetId, setResetId] = useState<number | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const loadStaff = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/staff", {
        credentials: "include",
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.replace("/staff/login");
        return;
      }
      if (response.status === 403) {
        setMessage(result.message || "Administrator access is required.");
        return;
      }
      if (!response.ok) {
        throw new Error(result.message || "Unable to load staff.");
      }

      setStaff(Array.isArray(result.staff) ? result.staff : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load staff.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStaff();
  }, []);

  const filteredStaff = useMemo(() => {
    const term = search.trim().toLowerCase();

    return staff.filter((member) => {
      const statusOk =
        statusFilter === "all" ||
        (statusFilter === "active" && member.isActive) ||
        (statusFilter === "inactive" && !member.isActive);

      if (!statusOk) return false;
      if (!term) return true;

      return [
        member.name,
        member.staffCode,
        member.role,
        member.mobile ?? "",
        member.username ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [staff, search, statusFilter]);

  const stats = useMemo(() => {
    const active = staff.filter((s) => s.isActive).length;
    const loginEnabled = staff.filter((s) => s.loginEnabled && s.isActive).length;
    const inactive = staff.length - active;
    return { total: staff.length, active, inactive, loginEnabled };
  }, [staff]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage("");
    setShowForm(true);
  };

  const openEdit = (member: Staff) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      role: member.role || "Other",
      mobile: member.mobile || "",
      address: member.address || "",
      joiningDate: member.joiningDate ? member.joiningDate.slice(0, 10) : "",
      username: member.username || "",
      loginEnabled: member.loginEnabled,
      password: "",
    });
    setMessage("");
    setShowForm(true);
  };

  const saveStaff = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setMessage("Staff name is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const endpoint = editingId ? `/api/staff/${editingId}` : "/api/staff";
      const method = editingId ? "PATCH" : "POST";

      const payload = {
        name: form.name.trim(),
        role: form.role,
        mobile: form.mobile.trim() || null,
        address: form.address.trim() || null,
        joiningDate: form.joiningDate || null,
        username: form.username.trim() || null,
        loginEnabled: form.loginEnabled,
        ...(editingId ? {} : { password: form.password }),
      };

      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.replace("/staff/login");
        return;
      }
      if (!response.ok) {
        throw new Error(result.message || "Unable to save staff.");
      }

      setMessage(editingId ? "Staff profile updated successfully." : "Staff member created successfully.");
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      await loadStaff();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save staff.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (member: Staff) => {
    const action = member.isActive ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} ${member.name}?`)) return;

    try {
      const response = await fetch(`/api/staff/${member.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !member.isActive }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(result.message || `Unable to ${action} staff.`);
      setMessage(`${member.name} is now ${!member.isActive ? "active" : "inactive"}.`);
      await loadStaff();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update staff.");
    }
  };

  const changeLogin = async (member: Staff) => {
    try {
      const response = await fetch(`/api/staff/${member.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginEnabled: !member.loginEnabled }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(result.message || "Unable to update login access.");
      setMessage(`${member.name}'s login access has been ${!member.loginEnabled ? "enabled" : "disabled"}.`);
      await loadStaff();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update login access.");
    }
  };

  const doResetPassword = async () => {
    if (!resetId || resetPassword.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    setResetting(true);
    try {
      const response = await fetch(`/api/staff/${resetId}/password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: resetPassword }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(result.message || "Unable to reset password.");
      setMessage("Password reset successfully.");
      setResetId(null);
      setResetPassword("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to reset password.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Staff Management</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Hospital Staff Administration</h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage staff profiles, roles, login access and employment status.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => void loadStaff()}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Refresh
              </button>
              <button
                onClick={openCreate}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                + Add Staff
              </button>
            </div>
          </div>
        </header>

        {message && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
            {message}
          </div>
        )}

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Total Staff", stats.total],
            ["Active", stats.active],
            ["Inactive", stats.inactive],
            ["Login Enabled", stats.loginEnabled],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 lg:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, staff code, role, mobile or username..."
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <div className="flex rounded-xl border border-slate-300 p-1">
              {(["active", "all", "inactive"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${
                    statusFilter === value ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">Loading staff...</div>
          ) : filteredStaff.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-semibold text-slate-700">No staff found</p>
              <p className="mt-1 text-sm text-slate-500">Try another search or add a new staff member.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1050px] w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Staff</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Login</th>
                    <th className="px-5 py-3">Joining</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{member.name}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{member.staffCode}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{member.role}</td>
                      <td className="px-5 py-4">
                        <div className="text-slate-700">{member.mobile || "—"}</div>
                        <div className="max-w-xs truncate text-xs text-slate-500">{member.address || "—"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-700">{member.username || "No username"}</div>
                        <div className={`text-xs ${member.loginEnabled ? "text-emerald-600" : "text-slate-400"}`}>
                          {member.loginEnabled ? "Enabled" : "Disabled"} · Last login {formatDateTime(member.lastLoginAt)}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{formatDate(member.joiningDate)}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${member.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {member.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(member)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100">
                            Edit
                          </button>
                          <button onClick={() => void changeLogin(member)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100">
                            {member.loginEnabled ? "Disable Login" : "Enable Login"}
                          </button>
                          {member.loginEnabled && (
                            <button onClick={() => { setResetId(member.id); setResetPassword(""); }} className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50">
                              Reset Password
                            </button>
                          )}
                          <button onClick={() => void toggleActive(member)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${member.isActive ? "border border-red-200 text-red-600 hover:bg-red-50" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                            {member.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{editingId ? "Edit Staff" : "Add New Staff"}</h2>
                  <p className="text-xs text-slate-500">Keep staff and login information up to date.</p>
                </div>
                <button onClick={() => setShowForm(false)} className="text-2xl text-slate-400 hover:text-slate-700">×</button>
              </div>

              <form onSubmit={saveStaff} className="space-y-5 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">
                    Full Name *
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" required />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Role *
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500">
                      {ROLES.map((role) => <option key={role}>{role}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Mobile
                    <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Joining Date
                    <input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" />
                  </label>
                </div>

                <label className="block text-sm font-medium text-slate-700">
                  Address
                  <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" />
                </label>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-semibold text-slate-800">Login Access</h3>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <label className="text-sm font-medium text-slate-700">
                      Username
                      <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500" />
                    </label>
                    {!editingId && (
                      <label className="text-sm font-medium text-slate-700">
                        Initial Password
                        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} placeholder="Minimum 6 characters" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500" />
                      </label>
                    )}
                  </div>
                  <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input type="checkbox" checked={form.loginEnabled} onChange={(e) => setForm({ ...form, loginEnabled: e.target.checked })} className="h-4 w-4" />
                    Allow staff to log in
                  </label>
                  {!editingId && <p className="mt-2 text-xs text-slate-500">A password is required when login access is enabled.</p>}
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold">Cancel</button>
                  <button disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                    {saving ? "Saving..." : editingId ? "Save Changes" : "Create Staff"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {resetId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
              <h2 className="text-lg font-bold text-slate-900">Reset Staff Password</h2>
              <p className="mt-1 text-sm text-slate-500">Enter a new password for this staff member.</p>
              <input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                minLength={6}
                placeholder="Minimum 6 characters"
                className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setResetId(null)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold">Cancel</button>
                <button disabled={resetting} onClick={() => void doResetPassword()} className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                  {resetting ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
