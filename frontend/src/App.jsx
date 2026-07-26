import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Listing from "../src/components/listing";
import ReleaseTktDetails from "../src/components/tktDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Listing />} />
        <Route path="/releases/:releaseId" element={<ReleaseTktDetails />} />
      </Routes>
    </BrowserRouter>
  );
}