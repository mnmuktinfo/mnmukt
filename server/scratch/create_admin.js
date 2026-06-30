const { auth, db } = require("../src/config/firebaseAdmin");

const email = "admin123@gmail.com";
const password = "Admin123@gmail.com";
const name = "Admin User";

async function createAdmin() {
  console.log(`=== Creating Admin User: ${email} ===`);
  try {
    let userRecord;
    try {
      // Check if user already exists in Auth
      userRecord = await auth.getUserByEmail(email);
      console.log(`User already exists in Firebase Auth (UID: ${userRecord.uid}). Updating password...`);
      await auth.updateUser(userRecord.uid, { password });
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        // Create new user
        userRecord = await auth.createUser({
          email,
          password,
          displayName: name,
          emailVerified: true
        });
        console.log(`Successfully created user in Firebase Auth (UID: ${userRecord.uid})`);
      } else {
        throw err;
      }
    }

    // Create or update Firestore document
    const userDocRef = db.collection("users").doc(userRecord.uid);
    const adminData = {
      uid: userRecord.uid,
      name,
      email: email.toLowerCase(),
      isAdmin: true,
      isBlocked: false,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await userDocRef.set(adminData, { merge: true });
    console.log(`Successfully created/updated Firestore document for UID: ${userRecord.uid}`);

    // Set custom claims (optional but highly recommended for security)
    await auth.setCustomUserClaims(userRecord.uid, { role: "admin" });
    console.log(`Successfully set custom claims (role: admin) for UID: ${userRecord.uid}`);

    console.log("=== Admin creation completed successfully! ===");
  } catch (error) {
    console.error("Error creating admin user:", error.message);
  }
}

createAdmin().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
