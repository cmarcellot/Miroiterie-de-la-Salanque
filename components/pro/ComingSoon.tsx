export default function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="pro-phead">
        <div>
          <div className="pro-lab">Module en préparation</div>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="pro-empty">
        <div className="pro-lab" style={{ color: "var(--cyan)" }}>
          Bientôt disponible
        </div>
        <p
          style={{
            margin: "10px auto 0",
            maxWidth: "42ch",
            fontSize: 13.5,
            color: "var(--ink-2)",
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
