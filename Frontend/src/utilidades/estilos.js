const ETIQUETAS = {
  Matemáticas: "tag-primary",
  Ciencias: "tag-accent",
  Ingeniería: "tag-secondary",
  Humanidades: "tag-muted",
};

export function tagDeArea(area) {
  return ETIQUETAS[area] || "tag-primary";
}
