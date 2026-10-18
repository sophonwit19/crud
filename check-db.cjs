
const Database = require("better-sqlite3");

const db = new Database("dev.db");

const email = "sophonwit.ka@kkumail.com";

const user = db
  .prepare('SELECT id, name, email, role FROM "User" WHERE email = ?')
  .get(email);

if (!user) {
  console.log("ไม่พบผู้ใช้ที่ระบุ จึงไม่มีการเปลี่ยนแปลงข้อมูล");
} else {
  console.log("ข้อมูลก่อนเปลี่ยนสิทธิ์:");
  console.table([user]);

  if (user.role !== "ADMIN") {
    db.prepare('UPDATE "User" SET role = ? WHERE email = ?')
      .run("ADMIN", email);
  }

  const updatedUser = db
    .prepare('SELECT id, name, email, role FROM "User" WHERE email = ?')
    .get(email);

  console.log("ข้อมูลหลังเปลี่ยนสิทธิ์:");
  console.table([updatedUser]);
}

db.close();
