import Term from "./Term";

// Tech words we auto-detect inside AI-written text and make clickable.
// Longer phrases first so "Power BI" wins over "BI".
export const KNOWN_TERMS = [
  "Pivot Table", "Power BI", "Data Cleaning", "Data Visualization", "Machine Learning", "REST API",
  "CI/CD", "GitHub", "Git", "SQL", "JOIN", "GROUP BY", "Python", "Pandas", "Excel", "Tableau",
  "dashboard", "dataset", "database", "API", "statistics", "regression", "visualization", "KPI",
  "schema", "query", "queries", "CSV", "repository", "commit", "frontend", "backend", "framework",
  "library", "React", "JavaScript", "TypeScript", "HTML", "CSS", "Docker", "Kubernetes", "Linux",
  "cloud", "AWS", "Azure", "pipeline", "hypothesis", "outlier",
].sort((a, b) => b.length - a.length);

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const pattern = new RegExp(`\\b(${KNOWN_TERMS.map(escape).join("|")})\\b`, "gi");

// <TermText text="Learn SQL and Power BI" /> → "Learn <Term>SQL</Term> and <Term>Power BI</Term>"
export default function TermText({ text }: { text: string }) {
  const parts = text.split(pattern); // odd indexes are the matched terms
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Term key={i} word={KNOWN_TERMS.find((t) => t.toLowerCase() === part.toLowerCase()) ?? part}>
            {part}
          </Term>
        ) : (
          part
        )
      )}
    </>
  );
}
