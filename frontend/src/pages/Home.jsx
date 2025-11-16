export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <h1 className="text-5xl font-bold mb-4">Hive Gaming Zone</h1>
      <a
        href="/slots"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-xl rounded-lg"
      >
        Book a Slot
      </a>
    </div>
  );
}
