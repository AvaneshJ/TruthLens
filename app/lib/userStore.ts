// Shared in-memory user store
// Both the signup API and NextAuth read/write from here
// Replace with a real database (MongoDB, PostgreSQL) in production

export interface StoredUser {
  email: string
  name: string
  password: string
}

// This array persists for the lifetime of the server process
const users: StoredUser[] = []

export function createUser(email: string, name: string, password: string): StoredUser {
  const user = { email, name, password }
  users.push(user)
  return user
}

export function findUserByEmail(email: string): StoredUser | null {
  return users.find(u => u.email === email) || null
}

export function findUserByCredentials(email: string, password: string): StoredUser | null {
  return users.find(u => u.email === email && u.password === password) || null
}

export function emailExists(email: string): boolean {
  return users.some(u => u.email === email)
}
