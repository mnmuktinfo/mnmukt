export default function AuthCard({ children }) {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
      <h1 className="text-2xl font-bold text-pink-600 mb-6 tracking-wide">
        MNMUKT
      </h1>

      {children}
    </div>
  );
}
