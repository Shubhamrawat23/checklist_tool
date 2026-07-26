import React, { useState, useEffect } from "react";
import ReleaseForm from "../components/releaseForm";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";


export default function Listing() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const fetchReleases = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/tkt/list`, { headers: { accept: "application/json" } });
      const json = await res.json();

      if (!json.success) {
        setError(json.message || "Failed to load releases");
        setReleases([]);
        return;
      }

      const items = (json.data || []).filter((r) => !r.is_delete);
      setReleases(items);
    } catch (err) {
      setError("Couldn't reach the API");
      setReleases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this release?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`${BASE_URL}/tkt/delete/${id}`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
        },
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error || "Failed to delete release.");
        return;
      }

      fetchReleases();

    } catch (err) {
      setError("Failed to connect to server.");
    }
  };

  const handleCreateSuccess = () => {
    setShowForm(false);
    fetchReleases();
  };

  const statusStyle = {
    planned: "bg-blue-900/40 text-blue-400",
    ongoing: "bg-yellow-900/40 text-yellow-400",
    done: "bg-green-900/40 text-green-400",
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-5xl font-bold">Release checklist</h1>

            <p className="text-zinc-400 mt-2">
              {releases.length} releases tracked
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-medium cursor-pointer"
            >
              + New release
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden border border-zinc-700">

          <table className="w-full">

            <thead className="bg-zinc-900 border-b border-zinc-700">
              <tr className="text-zinc-400">
                <th className="text-left px-6 py-5">Name</th>
                <th className="text-left px-6 py-5">Release Date</th>
                <th className="text-left px-6 py-5">Status</th>
                <th className="text-right px-6 py-5">Action</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-10 text-zinc-500"
                  >
                    Loading releases...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-10 text-red-400"
                  >
                    {error}
                  </td>
                </tr>
              ) : releases.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-10 text-zinc-500"
                  >
                    No releases found
                  </td>
                </tr>
              ) : (
                releases.map((release) => (
                  <tr
                    key={release.id}
                    className="border-t border-zinc-700 hover:bg-zinc-800/60 transition"
                  >
                    <td className="px-6 py-6 font-semibold text-lg">
                      {release.name}
                    </td>

                    <td className="px-6 py-6 text-zinc-300">
                      {new Date(
                        release.release_date
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-6 py-6">
                      <span
                        className={`capitalize px-4 py-1 rounded-full text-sm font-semibold ${statusStyle[release.status]
                          }`}
                      >
                        {release.status}
                      </span>
                    </td>

                    <td className="px-6 py-6">
                      <div className="flex justify-end gap-4">

                        <button
                          onClick={() => navigate(`/releases/${release.id}`)}
                          className="text-blue-400 hover:text-blue-300 cursor-pointer"
                        >
                          View
                        </button>

                        <button
                          onClick={() => handleDelete(release.id)}
                          className="text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black/60 flex items-start justify-center overflow-y-auto z-50 p-6"
          onClick={() => setShowForm(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full">
            <ReleaseForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};