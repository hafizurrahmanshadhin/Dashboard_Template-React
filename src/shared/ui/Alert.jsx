export default function Alert({ variant = "warning", children }) {
  return <div className={`alert alert-${variant}`}>{children}</div>;
}
