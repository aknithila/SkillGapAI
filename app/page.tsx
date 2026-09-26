import Link from "next/link";
import { GraduationCap, Briefcase, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const personas = [
  {
    icon: GraduationCap,
    title: "Student",
    text: "Still in college? See what employers expect and start building skills before placements.",
  },
  {
    icon: Briefcase,
    title: "Graduate",
    text: "Just graduated? Find the exact gaps between your degree and your first job.",
  },
  {
    icon: RefreshCw,
    title: "Career Switcher",
    text: "Changing fields? Discover which of your skills transfer and what to learn next.",
  },
];

export default function Home() {
  return (
    <div className="space-y-12 py-8 text-center">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Know exactly how <span className="text-indigo-600">job-ready</span> you are.
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          SkillGap AI assesses your skills, shows your gaps, builds a week-by-week roadmap, and grades
          real projects — with every tech term explained simply in English, Tamil or Hindi.
        </p>
        <Button asChild size="lg">
          <Link href="/assess">
            Start assessment <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 text-left sm:grid-cols-3">
        {personas.map(({ icon: Icon, title, text }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="mb-2 h-8 w-8 text-indigo-600" />
              <CardTitle>{title}</CardTitle>
              <CardDescription>{text}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </section>
    </div>
  );
}
