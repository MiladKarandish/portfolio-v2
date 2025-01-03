"use client";

import { useState } from "react";
import { auth } from "@/services/iLovePdf";

const DownloadResume = () => {
  const [loading, setLoading] = useState(false);

  const onDownload = async () => {
    setLoading(true);
    await auth();
    setLoading(false);
  };

  return (
    <button onClick={onDownload} disabled={loading}>
      {loading ? "Downloading..." : "Resume"}
    </button>
  );
};

export default DownloadResume;
