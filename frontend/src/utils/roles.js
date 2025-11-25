export const ROLES = {
  ADMIN: 'admin',
  PASIEN: 'pasien',
  RESEPSIONIS: 'resepsionis',
  DOKTER: 'dokter',
  APOTEKER: 'apoteker',
  KASIR: 'kasir'
};

export const hasPermission = (userRole, requiredRoles) => {
  return requiredRoles.includes(userRole);
};