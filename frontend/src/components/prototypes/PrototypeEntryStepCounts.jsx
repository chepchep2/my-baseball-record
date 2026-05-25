"use client";

import React from "react";
import EntryStepCounts from "@/features/entry/components/EntryStepCounts";

export default function PrototypeEntryStepCounts(props) {
  return <EntryStepCounts {...props} showProgress={false} />;
}
