const { auth, db } = require("../src/config/firebaseAdmin");

async function inspectUsers() {
  console.log("=== Inspecting Firebase Auth Users ===");
  try {
    const authUsersResult = await auth.listUsers();
    console.log(`Found ${authUsersResult.users.length} users in Firebase Auth:`);
    authUsersResult.users.forEach(user => {
      console.log(`- UID: ${user.uid}, Email: ${user.email}, DisplayName: ${user.displayName}, CustomClaims:`, user.customClaims);
    });
  } catch (error) {
    console.error("Error listing Firebase Auth users:", error.message);
  }

  console.log("\n=== Inspecting Firestore 'users' Collection ===");
  try {
    const usersSnapshot = await db.collection("users").get();
    console.log(`Found ${usersSnapshot.size} documents in Firestore 'users' collection:`);
    usersSnapshot.forEach(doc => {
      console.log(`- ID: ${doc.id} =>`, doc.data());
    });
  } catch (error) {
    console.error("Error listing Firestore users:", error.message);
  }
}

inspectUsers().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
