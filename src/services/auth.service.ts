import { db } from '../db'; // Drizzle client instance
import { users, userRoles, organizationUsers, userRoles as rolesTable, CreateUserInput, userTokens } from '../db/schema'; // import schema Drizzle
import { eq, or } from 'drizzle-orm';
import { bcryptHash } from '@/utils/hashing';
import { transformPhoneNumber } from '@/utils/formater';

// GET all users (superadmin & owner users)
export async function getUsers() {
  return await db.select({
    id: users.id,
    createdAt: users.createdAt,
    email: users.email,
    firstName: users.firstName,
    lastName: users.lastName,
    phone: users.phone,
    username: users.username,
  }).from(users);
}

// GET user by email or phone + include roles
export async function getUser({ email, phone }: { email: string; phone: string; }) {
  const phoneFormatted = await transformPhoneNumber(phone);

  // join users and organizationUsers + userRoles to get roles names
  const user = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone,
      username: users.username,
      createdAt: users.createdAt,
      roles: rolesTable.name,
      password: users.password

    })
    .from(users)
    .leftJoin(organizationUsers, eq(users.id, organizationUsers.userId))
    .leftJoin(userRoles, eq(organizationUsers.roleId, userRoles.id))
    .where(
      or(
        eq(users.email, email.toLowerCase()),
        eq(users.phone, phoneFormatted),
      ),
    )
    .limit(1);

  return user.length ? user[0] : null;
}

// CREATE user + assign default USER role (as transaction)
export async function createUser(data: CreateUserInput) {
  return await db.transaction(async (tx) => {
    // Cari role 'USER' di userRoles (id tipe integer)
    const [role] = await tx
      .select()
      .from(userRoles)
      .where(eq(userRoles.name, 'USER'))
      .limit(1);

    if (!role) throw new Error("Role 'USER' tidak ditemukan");

    // Hash password dan format phone
    const passwordHashed = await bcryptHash(data.password);
    const phoneFormatted = await transformPhoneNumber(data.phone);

    // Buat user baru
    const [user] = await tx
      .insert(users)
      .values({
        email: data.email.toLowerCase(),
        firstName: data.firstName,
        lastName: data.lastName,
        password: passwordHashed,
        phone: phoneFormatted,
        username: data.username,
        isPlatformOwner: data.isPlatformOwner ?? false,
      })
      .returning();

    // Jika user adalah platform owner (superadmin), biasanya tidak join organisasi,
    // jadi skip buat organisasiUsers relation.
    // Kalau user biasa, bisa ditambahkan logic join organisasi setelah ini.

    if (!data.isPlatformOwner) {
      // Misal organizationId harus ada, sesuaikan dengan organisasi user bergabung
      // Contoh organizationId dummy: 'uuid-of-organization'
      const organizationId = 'uuid-of-organization'; // Ganti sesuai organisasi user

      await tx.insert(organizationUsers).values({
        userId: user.id,
        organizationId: organizationId,
        roleId: role.id,
        isOwner: false,
      });
    }

    return user;
  });
}

// GET user by ID + include roles
export async function getUserById(id: string) {
  const user = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone,
      username: users.username,
      createdAt: users.createdAt,
      roles: rolesTable.name,
    })
    .from(users)
    .leftJoin(organizationUsers, eq(users.id, organizationUsers.userId))
    .leftJoin(userRoles, eq(organizationUsers.roleId, userRoles.id))
    .where(eq(users.id, id))
    .limit(1);

  return user.length ? user[0] : null;
}


export async function saveRefreshToken(userId: string, token: string, expiresAt: Date) {
  const [inserted] = await db.insert(userTokens).values({
    userId: userId,
    token,
    type: 'refresh_token',
    createdAt: new Date(),
    expiresAt: expiresAt
  }).returning();

  return inserted;
}


export async function verifyRefreshToken(token: string) {
  const result = await db
    .select()
    .from(userTokens)
    .where(eq(userTokens.token, token))
    .limit(1);

  if (result.length) {
    return result[0];
  } else {
    return null;
  }
}

export async function revokeRefreshToken(token: string) {
  return await db.delete(userTokens).where(eq(userTokens.token, token));
}