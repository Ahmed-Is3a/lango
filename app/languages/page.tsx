import Link from "next/link";
import { getAllLanguages } from "../lib/queries";

export default async function LanguagesPage() {
  const languages = await getAllLanguages();
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold mb-6">Languages</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {languages.map((lang: any) => (
          <Link key={lang.id} href={`/languages/${lang.id}`}>
            <div className="card">
              <h2 className="card-title">{lang.name}</h2>
              <p className="text-sm text-gray-600">Level: {lang.level ?? "Not set"}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
