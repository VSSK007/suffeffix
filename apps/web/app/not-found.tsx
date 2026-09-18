import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center space-y-3">
      <h1 className="text-2xl">Not in the graph</h1>
      <p className="text-sm text-muted">No node lives at this address.</p>
      <Link href="/" className="text-sm underline underline-offset-2" style={{ color: "var(--accent)" }}>
        Back to search
      </Link>
    </div>
  );
}
