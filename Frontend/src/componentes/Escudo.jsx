import { Shield } from "lucide-react";

export default function Escudo({ className = "" }) {
  return (
    <Shield
      className={className}
      strokeWidth={1.5}
      role="img"
      aria-label="Escudo Universidad Nacional de Colombia"
    />
  );
}
