"use client";

import { useState } from "react";
import { auth } from "@/services/iLovePdf";

const Download = () => {
  const [loading, setLoading] = useState(false);

  const onDownload = async () => {
    setLoading(true);
    await auth();
    setLoading(false);
  };

  return (
    <div
      style={{
        width: "100dvw",
        height: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <button
        onClick={onDownload}
        style={{
          cursor: "pointer",
          width: "50%",
          height: "30%",
          backgroundColor: "cornflowerblue",
          color: "white",
          border: "0",
          borderRadius: "12px",
        }}
        disabled={loading}
      >
        {loading ? "Downloading..." : "Click To Download"}
      </button>
    </div>
  );
};

export default Download;
