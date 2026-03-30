import React, { lazy, Suspense } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';

function Health() { return <div id="health">ok</div>; }

function SlideLoader() {
  const { nnn } = useParams<{ nnn: string }>();
  const outDir = import.meta.env.VITE_OUT_DIR;
  if (!outDir || !nnn) return <div>No slide</div>;

  const SlideComponent = lazy(() => import(/* @vite-ignore */ `${outDir}/slides/Slide${nnn}.tsx`));
  return (
    <Suspense fallback={<div style={{ width:1440, height:810 }} />}>
      <SlideComponent />
    </Suspense>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/health"        element={<Health />} />
      <Route path="/slide/:nnn"    element={<SlideLoader />} />
    </Routes>
  );
}
