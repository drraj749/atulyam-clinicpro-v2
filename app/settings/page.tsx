"use client";

import { useEffect, useState } from "react";

type Settings = {
  hospitalName: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;

  phone: string;
  email: string;
  website: string;

  doctorName: string;
  qualification: string;
  registrationNo: string;

  logo: string;
  signature: string;

  prescriptionFooter: string;
};

const initialState: Settings = {
  hospitalName: "",
  tagline: "",
  address: "",
  city: "",
  state: "",
  pincode: "",

  phone: "",
  email: "",
  website: "",

  doctorName: "",
  qualification: "",
  registrationNo: "",

  logo: "",
  signature: "",

  prescriptionFooter: "",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const response = await fetch("/api/settings");
      const result = await response.json();

      if (result.success) {
        setSettings(result.settings);
      }
    } catch (error) {
      console.error(error);
      alert("Unable to load settings.");
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (result.success) {
        alert("Settings saved successfully.");
      } else {
        alert(result.message || "Unable to save settings.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  function update(field: keyof Settings, value: string) {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function downloadBackup() {
    window.open("/api/backup", "_blank");
  }

  async function restoreDatabase(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (
      !confirm(
        "Restore database?\n\nPlease make sure you already downloaded a backup.\n\nContinue?"
      )
    ) {
      e.target.value = "";
      return;
    }

    try {
      setRestoring(true);

      const formData = new FormData();
      formData.append("database", file);

      const response = await fetch("/api/restore", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      alert(result.message);

      if (result.success) {
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
      alert("Restore failed.");
    } finally {
      setRestoring(false);
      e.target.value = "";
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-8">
        Hospital Settings
      </h1>

      <div className="bg-white rounded-xl shadow border p-6 space-y-8">

        {/* Hospital Information */}

        <div>

          <h2 className="text-xl font-semibold mb-4">
            Hospital Information
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <input
              className="border rounded p-2"
              placeholder="Hospital Name"
              value={settings.hospitalName}
              onChange={(e) =>
                update("hospitalName", e.target.value)
              }
            />

            <input
              className="border rounded p-2"
              placeholder="Tagline"
              value={settings.tagline}
              onChange={(e) =>
                update("tagline", e.target.value)
              }
            />

            <input
              className="border rounded p-2 col-span-2"
              placeholder="Address"
              value={settings.address}
              onChange={(e) =>
                update("address", e.target.value)
              }
            />

            <input
              className="border rounded p-2"
              placeholder="City"
              value={settings.city}
              onChange={(e) =>
                update("city", e.target.value)
              }
            />

            <input
              className="border rounded p-2"
              placeholder="State"
              value={settings.state}
              onChange={(e) =>
                update("state", e.target.value)
              }
            />

            <input
              className="border rounded p-2"
              placeholder="PIN Code"
              value={settings.pincode}
              onChange={(e) =>
                update("pincode", e.target.value)
              }
            />

            <input
              className="border rounded p-2"
              placeholder="Phone"
              value={settings.phone}
              onChange={(e) =>
                update("phone", e.target.value)
              }
            />

            <input
              className="border rounded p-2"
              placeholder="Email"
              value={settings.email}
              onChange={(e) =>
                update("email", e.target.value)
              }
            />

            <input
              className="border rounded p-2 col-span-2"
              placeholder="Website"
              value={settings.website}
              onChange={(e) =>
                update("website", e.target.value)
              }
            />

          </div>

        </div>

        {/* Doctor Information */}

        <div>

          <h2 className="text-xl font-semibold mb-4">
            Doctor Information
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <input
              className="border rounded p-2"
              placeholder="Doctor Name"
              value={settings.doctorName}
              onChange={(e) =>
                update("doctorName", e.target.value)
              }
            />

            <input
              className="border rounded p-2"
              placeholder="Qualification"
              value={settings.qualification}
              onChange={(e) =>
                update("qualification", e.target.value)
              }
            />

            <input
              className="border rounded p-2 col-span-2"
              placeholder="Registration Number"
              value={settings.registrationNo}
              onChange={(e) =>
                update("registrationNo", e.target.value)
              }
            />

          </div>

        </div>

        {/* Print Settings */}

        <div>

          <h2 className="text-xl font-semibold mb-4">
            Print Settings
          </h2>

          <div className="space-y-4">

            <input
              className="border rounded p-2 w-full"
              placeholder="Logo Path / URL"
              value={settings.logo}
              onChange={(e) =>
                update("logo", e.target.value)
              }
            />

            <input
              className="border rounded p-2 w-full"
              placeholder="Signature Path / URL"
              value={settings.signature}
              onChange={(e) =>
                update("signature", e.target.value)
              }
            />

            <textarea
              className="border rounded p-2 w-full h-32"
              placeholder="Prescription Footer"
              value={settings.prescriptionFooter}
              onChange={(e) =>
                update(
                  "prescriptionFooter",
                  e.target.value
                )
              }
            />

          </div>

        </div>

        {/* Actions */}

        <div className="border-t pt-6">

          <h2 className="text-xl font-semibold mb-4">
            Actions
          </h2>

          <div className="flex flex-wrap gap-4">

            <button
              onClick={saveSettings}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>

            <button
              onClick={downloadBackup}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
            >
              Download Backup
            </button>

            <label className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg cursor-pointer">

              {restoring ? "Restoring..." : "Restore Backup"}

              <input
                hidden
                type="file"
                accept=".db"
                disabled={restoring}
                onChange={restoreDatabase}
              />

            </label>

          </div>

        </div>

      </div>

    </div>
  );
}