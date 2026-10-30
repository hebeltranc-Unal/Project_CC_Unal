import { CalendarDays } from "lucide-react";

export default function TarjetaTutor({ tutor }) {
  const iniciales = tutor.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");

  return (
    <article className="tutor-card card-lift">
      <div className="tutor-head">
        <div className="tutor-avatar" aria-hidden="true">
          {iniciales}
        </div>
        <div>
          <h3>{tutor.name}</h3>
          <p className="tutor-career">{tutor.career}</p>
        </div>
      </div>
      <div className="tutor-subjects">
        {tutor.subjects.map((materia) => (
          <span key={materia}>{materia}</span>
        ))}
      </div>
      <p className="tutor-availability">
        <CalendarDays className="icon" aria-hidden="true" />
        {tutor.availability}
      </p>
    </article>
  );
}
