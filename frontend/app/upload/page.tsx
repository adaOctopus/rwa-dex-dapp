"use client";

// Upload page for asset/file uploads and metadata
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useWalletStore } from "@/store/walletStore";

export default function UploadPage() {
  const { isConnected, address } = useWalletStore();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileDescription, setFileDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; description: string; hash: string }>>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!file || !fileName) {
      alert("Please select a file and enter a name");
      return;
    }

    setUploading(true);
    try {
      // In a real implementation, this would upload to IPFS or similar
      // For now, we'll simulate with a hash
      const fileHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      setUploadedFiles([
        ...uploadedFiles,
        {
          name: fileName,
          description: fileDescription,
          hash: fileHash,
        },
      ]);

      alert("File uploaded successfully! (Simulated)");
      setFile(null);
      setFileName("");
      setFileDescription("");
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-white text-xl">Please connect your wallet to upload assets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Upload Assets</h1>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Upload New Asset</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Asset Name</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter asset name"
                  className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  placeholder="Enter asset description"
                  rows={4}
                  className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
                />
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload Asset"}
              </button>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Uploaded Assets</h2>
              <div className="space-y-3">
                {uploadedFiles.map((uploaded, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-4">
                    <p className="text-white font-medium">{uploaded.name}</p>
                    {uploaded.description && (
                      <p className="text-gray-300 text-sm mt-1">{uploaded.description}</p>
                    )}
                    <p className="text-gray-400 text-xs mt-2">Hash: {uploaded.hash}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

