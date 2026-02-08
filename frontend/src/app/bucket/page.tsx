import { Suspense } from "react";
import BucketClient from "./BucketClient";

export default function BucketPage() {
  return (
    <Suspense fallback={<div className="text-sm text-white/60">Se încarcă...</div>}>
      <BucketClient />
    </Suspense>
  );
}
