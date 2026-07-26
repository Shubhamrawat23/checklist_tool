import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import { useNavigate, useParams } from "react-router-dom";


function formatDate(iso) {
    if (!iso) return "—";

    const d = new Date(iso);

    if (isNaN(d.getTime())) return iso;

    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function ReleaseTktDetails() {
    const navigate = useNavigate();
    const { releaseId } = useParams();

    const [release, setRelease] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRelease();
    }, [releaseId]);

    const fetchRelease = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch(`${BASE_URL}/tkt/${releaseId}`);

            const json = await res.json();

            if (!json.success) {
                setError(json.error || "Failed to fetch release.");
                return;
            }

            setRelease({
                name: json.data.name,
                release_date: json.data.release_date,
            });
            setTasks(json.data.tasks || []);
            setNotes(json.data.notes || "");
        } catch (err) {
            setError("Failed to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = (taskId) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId
                    ? {
                        ...task,
                        is_completed: !task.is_completed,
                    }
                    : task
            )
        );
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setSaved(false);
            setError(null);

            const payload = {
                name: release.name,
                release_date: release.release_date,
                notes,
                task: tasks.map((task) => ({
                    task_id: task.id,
                    is_completed: task.is_completed,
                })),
            };

            console.log(payload);

            const res = await fetch(`${BASE_URL}/tkt/update/${releaseId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (!json.success) {
                setError(json.error || "Unable to update release.");
                return;
            }

            setSaved(true);

            fetchRelease();
        } catch (err) {
            setError("Failed to connect to server.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this release?"
        );

        if (!confirmDelete) return;

        try {
            setDeleting(true);
            setError(null);

            const res = await fetch(`${BASE_URL}/tkt/delete/${releaseId}`, {
                method: "DELETE",
                headers: {
                    accept: "application/json",
                },
            });

            const json = await res.json();

            if (!json.success) {
                setError(json.error || "Unable to delete release.");
                return;
            }

            navigate("/");
        } catch (err) {
            setError("Failed to connect to server.");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-white text-xl">
                Loading...
            </div>
        );
    }

    if (error && !release) {
        return (
            <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center text-white">
                <p className="text-red-500">{error}</p>

                <button
                    onClick={() => navigate("/")}
                    className="mt-5 bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded cursor-pointer"
                >
                    Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-white p-8">
            <div className="max-w-3xl mx-auto border border-zinc-700 rounded-xl p-8 shadow-lg">

                <button
                    onClick={() => navigate("/")}
                    className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-white cursor-pointer"
                >
                    ← Back
                </button>

                <div className="space-y-6 flex justify-between">

                    <div>
                        <label className="block mb-2 text-sm font-medium text-zinc-400">
                            Release Name
                        </label>

                        <input
                            type="text"
                            value={release?.name || ""}
                            onChange={(e) =>
                                setRelease((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                            placeholder="Release name"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-zinc-400">
                            Release Date
                        </label>

                        <input
                            type="date"
                            value={
                                release?.release_date
                                    ? release.release_date.split("T")[0]
                                    : ""
                            }
                            onChange={(e) =>
                                setRelease((prev) => ({
                                    ...prev,
                                    release_date: e.target.value,
                                }))
                            }
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                        />
                    </div>

                </div>

                {saved && (
                    <div className="mt-6 bg-green-900/30 border border-green-700 rounded p-3 text-green-400">
                        Release updated successfully.
                    </div>
                )}

                {error && (
                    <div className="mt-6 bg-red-900/30 border border-red-700 rounded p-3 text-red-400">
                        {error}
                    </div>
                )}

                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-5">
                        Release Checklist
                    </h2>

                    <div className="space-y-4">

                        {tasks.map((task) => (
                            <label
                                key={task.id}
                                className="flex items-center gap-3 p-4 border border-zinc-700 rounded-lg hover:bg-zinc-800 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={task.is_completed}
                                    onChange={() => toggleTask(task.id)}
                                    className="w-5 h-5 accent-blue-600"
                                />

                                <span
                                    className={
                                        task.is_completed
                                            ? "line-through text-zinc-500"
                                            : ""
                                    }
                                >
                                    {task.task_name}
                                </span>
                            </label>
                        ))}

                    </div>
                </div>

                <div className="mt-8">

                    <label className="block mb-2 font-medium">
                        Additional Information
                    </label>

                    <textarea
                        rows={5}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-4 outline-none resize-none"
                        placeholder="Write additional notes..."
                    />

                </div>

                <div className="mt-8 flex justify-between">

                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-6 py-3 rounded-lg font-medium cursor-pointer"
                    >
                        {deleting ? "Deleting..." : "Delete Release"}
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-lg font-medium cursor-pointer"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>

                </div>

            </div>
        </div>
    );
}