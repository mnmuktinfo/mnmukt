const { auth } = require("../src/config/firebaseAdmin");

const usersToDelete = [
  "amZjrD1krFg5uOFyBKnQFohRQY62", // admin123@gmail.com
  "iiaXEcGnVXQHCSdj44QliyObXsf2"  // mnmuktinfo1@gmail.com
];

async function cleanup() {
  console.log("=== Cleaning up partially-registered users ===");
  for (const uid of usersToDelete) {
    try {
      // Fetch user to print email
      const user = await auth.getUser(uid);
      console.log(`Deleting user: ${user.email} (UID: ${uid})...`);
      await auth.deleteUser(uid);
      console.log(`Successfully deleted ${user.email}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`User UID ${uid} not found, already deleted.`);
      } else {
        console.error(`Error deleting UID ${uid}:`, error.message);
      }
    }
  }
}

cleanup().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
