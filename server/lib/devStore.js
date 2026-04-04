import fs from "fs";
import path from "path";
import crypto from "crypto";

const dataDir = path.resolve(process.cwd(), "data");
const dataFile = path.join(dataDir, "dev-store.json");

function initialData() {
  return {
    users: [],
    chatMessages: [],
    sleepEntries: [],
    peerQueue: [],
    peerSessions: [],
    peerMessages: [],
  };
}

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(initialData(), null, 2));
  }
}

function readData() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function writeData(data) {
  ensureDataFile();
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function makeId() {
  return crypto.randomUUID();
}

function normalizeDate(value) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sortByDateAsc(list, key) {
  return [...list].sort((a, b) => new Date(a[key]) - new Date(b[key]));
}

export async function findUserByEmail(email) {
  const data = readData();
  return data.users.find((user) => user.email === email.toLowerCase()) || null;
}

export async function createUser({ name, email, password }) {
  const data = readData();
  const user = {
    _id: makeId(),
    name,
    email: email.toLowerCase(),
    password,
    anonymousUsername: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.users.push(user);
  writeData(data);
  return user;
}

export async function findUserById(userId) {
  const data = readData();
  return data.users.find((user) => user._id === userId) || null;
}

export async function updateUser(userId, patch) {
  const data = readData();
  const user = data.users.find((item) => item._id === userId);
  if (!user) return null;
  Object.assign(user, patch, { updatedAt: new Date().toISOString() });
  writeData(data);
  return user;
}

export async function createChatMessage({ userId, role, content, sentiment }) {
  const data = readData();
  const message = {
    _id: makeId(),
    userId,
    role,
    content,
    sentiment,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.chatMessages.push(message);
  writeData(data);
  return message;
}

export async function listChatMessages(userId) {
  const data = readData();
  return sortByDateAsc(
    data.chatMessages.filter((message) => message.userId === userId).slice(-100),
    "createdAt"
  );
}

export async function listRecentUserChats(userId, since) {
  const data = readData();
  return data.chatMessages
    .filter(
      (message) =>
        message.userId === userId &&
        message.role === "user" &&
        new Date(message.createdAt) >= since
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 30);
}

export async function saveSleepEntry({ userId, date, hours }) {
  const data = readData();
  const day = normalizeDate(date).toISOString();
  const existing = data.sleepEntries.find(
    (entry) => entry.userId === userId && entry.date === day
  );
  if (existing) {
    existing.hours = hours;
    existing.updatedAt = new Date().toISOString();
  } else {
    data.sleepEntries.push({
      _id: makeId(),
      userId,
      date: day,
      hours,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  writeData(data);
  return { date: day, hours };
}

export async function listSleepEntries(userId, since) {
  const data = readData();
  return sortByDateAsc(
    data.sleepEntries.filter(
      (entry) => entry.userId === userId && new Date(entry.date) >= since
    ),
    "date"
  );
}

export async function findActiveSessionForUser(userId) {
  const data = readData();
  return (
    data.peerSessions
      .filter(
        (session) =>
          (session.user1 === userId || session.user2 === userId) &&
          ["pending", "active"].includes(session.status)
      )
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] || null
  );
}

export async function findPeerQueueEntry(userId) {
  const data = readData();
  return data.peerQueue.find((entry) => entry.userId === userId) || null;
}

export async function findOldestOtherQueueEntry(userId) {
  const data = readData();
  return (
    data.peerQueue
      .filter((entry) => entry.userId !== userId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0] || null
  );
}

export async function enqueueUser(userId) {
  const data = readData();
  const existing = data.peerQueue.find((entry) => entry.userId === userId);
  if (!existing) {
    data.peerQueue.push({
      _id: makeId(),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    writeData(data);
  }
}

export async function removeQueuedUsers(userIds) {
  const data = readData();
  data.peerQueue = data.peerQueue.filter((entry) => !userIds.includes(entry.userId));
  writeData(data);
}

export async function createPeerSession({ user1, user2, status, acceptedBy }) {
  const data = readData();
  const session = {
    _id: makeId(),
    user1,
    user2,
    status,
    acceptedBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.peerSessions.push(session);
  writeData(data);
  return session;
}

export async function findPeerSessionById(sessionId) {
  const data = readData();
  return data.peerSessions.find((session) => session._id === sessionId) || null;
}

export async function updatePeerSession(sessionId, patch) {
  const data = readData();
  const session = data.peerSessions.find((item) => item._id === sessionId);
  if (!session) return null;
  Object.assign(session, patch, { updatedAt: new Date().toISOString() });
  writeData(data);
  return session;
}

export async function createPeerMessage({ sessionId, senderId, content }) {
  const data = readData();
  const message = {
    _id: makeId(),
    sessionId,
    senderId,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.peerMessages.push(message);
  writeData(data);
  return message;
}

export async function listPeerMessages(sessionId, since = null) {
  const data = readData();
  return sortByDateAsc(
    data.peerMessages.filter(
      (message) =>
        message.sessionId === sessionId &&
        (!since || new Date(message.createdAt) > since)
    ),
    "createdAt"
  ).slice(0, 200);
}
