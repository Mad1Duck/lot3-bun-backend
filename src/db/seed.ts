import { db } from './index';
import {
  users,
  organizations,
  userRoles,
  permissions,
  applications,
  features,
  packages,
  packageFeatures,
  subscriptions,
  organizationUsers,
  rolePermissions,
} from './schema';

export async function seed() {
  // 1. User platform: superadmin
  const [superadmin] = await db.insert(users).values({
    email: 'admin@platform.com',
    password: 'password1', // gunakan bcrypt hash asli
    isPlatformOwner: true,
    firstName: 'Super',
    lastName: 'Admin',
    phone: '081234567890',
    username: 'superadmin',
  }).returning();

  // 2. Roles
  const [roleOwner] = await db.insert(userRoles).values({ name: 'Owner' }).returning();
  const [roleAdmin] = await db.insert(userRoles).values({ name: 'Admin' }).returning();

  // 3. Permissions contoh
  const [permManageSubs] = await db.insert(permissions).values({
    name: 'Manage Subscriptions',
    code: 'subscriptions.manage',
    description: 'Kelola subscription aplikasi',
  }).returning();

  // 4. RolePermissions
  await db.insert(rolePermissions).values({
    roleId: roleOwner.id,
    permissionId: permManageSubs.id,
  });
  await db.insert(rolePermissions).values({
    roleId: roleAdmin.id,
    permissionId: permManageSubs.id,
  });

  // 5. Organizations
  const [org1] = await db.insert(organizations).values({
    name: 'Toko ABC',
  }).returning();

  // 6. OrganizationUsers (Owner)
  await db.insert(organizationUsers).values({
    userId: superadmin.id,
    organizationId: org1.id,
    roleId: roleOwner.id,
    isOwner: true,
  });

  // 7. Applications
  const [appAntrianku] = await db.insert(applications).values({
    name: 'Antrianku',
    description: 'Manajemen antrian pelanggan',
  }).returning();

  const [appShift] = await db.insert(applications).values({
    name: 'Shift',
    description: 'Manajemen shift pegawai',
  }).returning();

  const [appOrderTable] = await db.insert(applications).values({
    name: 'Order and Table',
    description: 'Manajemen order meja & kitchen display',
  }).returning();

  const [appRequestPegawai] = await db.insert(applications).values({
    name: 'Request Pegawai',
    description: 'Pengajuan cuti, lembur, dsb',
  }).returning();

  // 8. Features
  const [featSmsNotif] = await db.insert(features).values({
    applicationId: appAntrianku.id,
    name: 'SMS Notifikasi Antrian',
    code: 'antrianku.sms_notif',
    description: 'Kirim notifikasi SMS untuk antrian',
  }).returning();

  const [featShiftManage] = await db.insert(features).values({
    applicationId: appShift.id,
    name: 'Manage Shift',
    code: 'shift.manage',
    description: 'Kelola jadwal shift pegawai',
  }).returning();

  const [featOrderManage] = await db.insert(features).values({
    applicationId: appOrderTable.id,
    name: 'Manage Order & Table',
    code: 'order_table.manage',
    description: 'Kelola order di meja dan display kitchen',
  }).returning();

  const [featRequestManage] = await db.insert(features).values({
    applicationId: appRequestPegawai.id,
    name: 'Manage Request Pegawai',
    code: 'request_pegawai.manage',
    description: 'Kelola pengajuan cuti dan lembur',
  }).returning();

  // 9. Packages
  const [pkgBasicAntrianku] = await db.insert(packages).values({
    applicationId: appAntrianku.id,
    name: 'Basic',
    price: 50000,
  }).returning();

  const [pkgProShift] = await db.insert(packages).values({
    applicationId: appShift.id,
    name: 'Pro',
    price: 100000,
  }).returning();

  // 10. Hubungkan paket & fitur
  await db.insert(packageFeatures).values({
    packageId: pkgBasicAntrianku.id,
    featureId: featSmsNotif.id,
  });

  await db.insert(packageFeatures).values({
    packageId: pkgProShift.id,
    featureId: featShiftManage.id,
  });

  // 11. Subscription contoh
  await db.insert(subscriptions).values({
    organizationId: org1.id,
    applicationId: appAntrianku.id,
    packageId: pkgBasicAntrianku.id,
    startDate: new Date(),
    status: 'active',
  });

  // 12. Admin user untuk organisasi
  const [adminUser] = await db.insert(users).values({
    email: 'admin@tokoabc.com',
    password: 'hashed_password_here', // gunakan bcrypt hash asli
    firstName: 'Admin',
    lastName: 'TokoABC',
    phone: '081298765432',
    username: 'admintokoabc',
  }).returning();

  await db.insert(organizationUsers).values({
    userId: adminUser.id,
    organizationId: org1.id,
    roleId: roleAdmin.id,
    isOwner: false,
  });

  console.log('Seeding selesai');
}
