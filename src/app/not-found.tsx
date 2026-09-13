import Link from "next/link";

export default function NotFound() {
  return (
    <section className="block">
      <div className="wrap measure">
        <h1>Page not found</h1>
        <p className="muted" style={{ marginTop: 12 }}>
          That page doesn&apos;t exist (yet).
        </p>
        <Link href="/" className="link" style={{ display: "inline-block", marginTop: 20 }}>
          Back home
        </Link>
      </div>
    </section>
  );
}
