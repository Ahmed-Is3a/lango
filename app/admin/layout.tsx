export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-6">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>

        <nav className="space-y-2">
          <a className="block hover:text-gray-300" href="/admin/languages">Languages</a>
          <a className="block hover:text-gray-300" href="/admin/lessons">Lessons</a>
          <a className="block hover:text-gray-300" href="/admin/exercises">Exercises</a>
          <a className="block hover:text-gray-300" href="/admin/flashcards">Flashcards</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
