"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage("Please select a file to upload.");
      return;
    }

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const fileType = file.type;

      // Get signed URL from API
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileType }),
      });

      if (!res.ok) throw new Error("Failed to get upload URL");

      const { url } = await res.json();

      // Upload the file to Cloudflare R2
      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": fileType },
        body: file,
      });

      if (uploadRes.ok) {
        setUploadMessage("File uploaded successfully!");
      } else {
        throw new Error("Failed to upload file");
      }
    } catch (err) {
      console.error(err);
      setUploadMessage("File upload failed.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {userData && (
        <div className="mb-6">
          <p>Welcome, {userData.email}!</p>
          <p>User ID: {userData.userId}</p>
        </div>
      )}
      <div className="mb-6">
        <input type="file" onChange={handleFileChange} />
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-2"
        >
          Upload
        </button>
        {uploadMessage && <p className="mt-2">{uploadMessage}</p>}
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}
