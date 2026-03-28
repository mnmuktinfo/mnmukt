export default function AuthStatus({ title, success, error }) {
  let color = "text-gray-800";

  if (success) color = "text-green-600";
  if (error) color = "text-red-600";

  return <h2 className={`text-lg font-semibold mb-4 ${color}`}>{title}</h2>;
}
