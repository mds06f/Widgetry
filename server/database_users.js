const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const DB_FILE = path.join(__dirname, "users.json");

function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

function getAll() {
  initDB();
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading users database file:", err);
    return [];
  }
}

function saveAll(users) {
  initDB();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing to users database file:", err);
    return false;
  }
}

function getById(id) {
  const users = getAll();
  return users.find((u) => u.id === id);
}

function getByEmail(email) {
  const users = getAll();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

async function create(userData) {
  const users = getAll();

  // Encrypt password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(userData.password, salt);

  const newUser = {
    id: uuidv4(),
    email: userData.email.toLowerCase(),
    passwordHash: passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveAll(users);

  // Return user without password hash
  const { passwordHash: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

module.exports = {
  getAll,
  getById,
  getByEmail,
  create,
};
