export const defaultUsers = [
  { name: 'candidate', email: 'candidate@example.com', password: 'candidate123', role: 'candidate', status: 'active' },
  { name: 'hr', email: 'hr@example.com', password: 'hr123', role: 'hr', status: 'active' },
  { name: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin', status: 'active' },
];

export const localUsers = [...defaultUsers] as any[];

export function normalizeValue(value: unknown) {
  return String(value || '').trim().toLowerCase();
}

export function findLocalUser(username: string, password: string, role: string) {
  const normalizedUsername = normalizeValue(username);
  return localUsers.find(
    (user) =>
      (normalizeValue(user.email) === normalizedUsername || normalizeValue(user.name) === normalizedUsername) &&
      user.password === password &&
      normalizeValue(user.role) === normalizeValue(role)
  );
}

export function findLocalUserByEmailOrPhone(email: string, phone: string) {
  const normalizedEmail = normalizeValue(email);
  return localUsers.find(
    (user) =>
      (email && normalizeValue(user.email) === normalizedEmail) ||
      (phone && String(user.phone || '').trim() === String(phone).trim())
  );
}

export function userExists(email: string, name: string) {
  const normalizedEmail = normalizeValue(email);
  const normalizedName = normalizeValue(name);
  return localUsers.some(
    (user) => normalizeValue(user.email) === normalizedEmail || normalizeValue(user.name) === normalizedName
  );
}

export function createLocalUser(attrs: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  status: string;
  registrationOTP: string;
  registrationOTPExpires: Date;
}) {
  const user = {
    name: attrs.name,
    email: attrs.email,
    phone: attrs.phone,
    password: attrs.password,
    role: attrs.role,
    status: attrs.status,
    registrationOTP: attrs.registrationOTP,
    registrationOTPExpires: attrs.registrationOTPExpires,
  } as any;
  localUsers.push(user);
  return user;
}

export function updateLocalUser(user: any, updates: Record<string, any>) {
  Object.assign(user, updates);
  return user;
}
