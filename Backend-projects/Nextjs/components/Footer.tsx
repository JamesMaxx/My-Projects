export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-8">
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-gray-600">
        <div>© {new Date().getFullYear()} GitConnect — Connect with developers</div>
        <div className="space-x-4">
          <a className="text-gray-500 hover:text-gray-700">Privacy</a>
          <a className="text-gray-500 hover:text-gray-700">Terms</a>
        </div>
      </div>
    </footer>
  );
}
