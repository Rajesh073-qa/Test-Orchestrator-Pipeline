'use client';

import TestCaseDetail from "@/features/test-case/components/test-case-detail";
import { useParams } from "next/navigation";

export default function TestCaseDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="container mx-auto py-10 px-4">
      <TestCaseDetail id={id} />
    </div>
  );
}
