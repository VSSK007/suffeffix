import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center space-y-3">
      <h1 className="text-2xl">Not found</h1>
      <p className="text-sm text-neutral-600">That node is not in the graph.</p>
      <Link href="/" className="underline text-accent text-sm">Back to search</Link>
    </div>
  );
}
