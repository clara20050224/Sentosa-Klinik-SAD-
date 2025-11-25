/**
 * Get the default route for a user based on their role
 * @param {string} role - User role
 * @returns {string} - Default route path for the role
 */
export function getRoleRoute(role) {
  const roleRoutes = {
    admin: '/admin',
    pasien: '/dashboard',
    dokter: '/doctor',
    apoteker: '/pharmacist',
    kasir: '/cashier',
    resepsionis: '/receptionist'
  };

  return roleRoutes[role] || '/dashboard';
}

