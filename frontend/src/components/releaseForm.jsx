import React, { useState } from "react";
import {BASE_URL} from "../config";

function getTomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ReleaseForm({ onSuccess, onCancel }){
  const minDate = getTomorrowISO();
  const [name, setName] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const canSubmit = name.trim().length > 0 && releaseDate.length > 0 && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const payload = {
      name: name.trim(),
      release_date: releaseDate,
      notes: notes.trim() || "",
    };

    try {
      const res = await fetch(`${BASE_URL}/tkt/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.message || "Couldn't save the release. Try again.");
        return;
      }

      setSuccess(true);
      setName("");
      setReleaseDate("");
      setNotes("");

      if (onSuccess) onSuccess(json.data);
    } catch (err) {
      setError("Couldn't reach the API. Check that the server is running.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-zinc-900 shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">
        Create Release
      </h2>

      {error && (
        <div className="mb-5 bg-red-50 text-red-700 text-sm rounded px-4 py-3">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 bg-green-50 text-green-700 text-sm rounded px-4 py-3">
          Release saved.
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-2 font-medium">
            Release Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-4 py-2"
            placeholder="Release Name"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Release Date
          </label>
          <input
            type="date"
            min={minDate}
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            className="w-full border rounded px-4 py-2 [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Additional Information
          </label>
          <textarea
            rows="5"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded px-4 py-2"
            placeholder="Optional notes..."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded cursor-pointer"
          >
            {submitting ? "Saving..." : "Save Release"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 rounded border hover:bg-gray-50 hover:text-zinc-900 cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};