"use client";

import Calirty from "@microsoft/clarity";
import { useEffect } from "react";

const MicrosoftClarity = () => {
  Calirty.init("q4kcsgko00");

  useEffect(() => {
    Calirty.identify("custom-id", "custom-session-id", "custom-page-id", "friendly-name");
  }, []);

  return <></>;
};

export default MicrosoftClarity;
