export function buildSearchIndex({ displayName, email, phone }) {

  const name = (displayName || "").toLowerCase().trim();
  const emailLower = (email || "").toLowerCase().trim();
  const phoneStr = (phone || "").toString().trim();

  const index = new Set();

  // Name
  if (name) {
    index.add(name);

    name.split(" ").forEach(part => {
      if (part) index.add(part);
    });
  }

  // Email
  if (emailLower) {
    index.add(emailLower);

    const emailParts = emailLower.split("@");
    index.add(emailParts[0]);
  }

  // Phone
  if (phoneStr) {
    index.add(phoneStr);

    for (let i = 3; i <= phoneStr.length; i++) {
      index.add(phoneStr.slice(0, i));
    }
  }

  return Array.from(index);
}