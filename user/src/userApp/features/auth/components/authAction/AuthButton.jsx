export default function AuthButton({ children, onClick, href }) {
  const base =
    "mt-4 w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition";

  if (href) {
    return (
      <a href={href} className={base}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={base}>
      {children}
    </button>
  );
}
