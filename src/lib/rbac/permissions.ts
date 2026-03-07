// Guatemala FiniTax — Role-Based Access Control
// Roles: ADMIN, ACCOUNTANT, EMPLOYEE

export type Role = "admin" | "accountant" | "employee";

export const PERMISSIONS = {
  // Organization
  "org.view": "Ver organización",
  "org.edit": "Editar organización",
  "org.delete": "Eliminar organización",
  "org.members.view": "Ver miembros",
  "org.members.invite": "Invitar miembros",
  "org.members.remove": "Eliminar miembros",
  "org.members.role": "Cambiar roles",

  // FEL Invoicing
  "fel.view": "Ver facturas FEL",
  "fel.create": "Crear facturas FEL",
  "fel.edit": "Editar facturas FEL",
  "fel.delete": "Eliminar facturas FEL",
  "fel.void": "Anular facturas FEL",
  "fel.export": "Exportar facturas FEL",

  // Expenses
  "expenses.view": "Ver gastos",
  "expenses.create": "Crear gastos",
  "expenses.edit": "Editar gastos",
  "expenses.delete": "Eliminar gastos",
  "expenses.approve": "Aprobar gastos",

  // Chart of Accounts / Journal
  "accounts.view": "Ver plan de cuentas",
  "accounts.create": "Crear cuentas",
  "accounts.edit": "Editar cuentas",
  "accounts.delete": "Eliminar cuentas",
  "journal.view": "Ver diario contable",
  "journal.create": "Crear partidas",
  "journal.edit": "Editar partidas",
  "journal.delete": "Eliminar partidas",

  // Payroll
  "payroll.view": "Ver planilla",
  "payroll.create": "Crear planilla",
  "payroll.edit": "Editar planilla",
  "payroll.approve": "Aprobar planilla",
  "payroll.employees.view": "Ver empleados",
  "payroll.employees.create": "Crear empleados",
  "payroll.employees.edit": "Editar empleados",

  // Tax
  "tax.view": "Ver declaraciones",
  "tax.create": "Crear declaraciones",
  "tax.file": "Presentar declaraciones",

  // Banking
  "banking.view": "Ver cuentas bancarias",
  "banking.create": "Crear cuentas bancarias",
  "banking.reconcile": "Conciliar bancario",
  "banking.transactions": "Gestionar transacciones",

  // Contacts
  "contacts.view": "Ver contactos",
  "contacts.create": "Crear contactos",
  "contacts.edit": "Editar contactos",
  "contacts.delete": "Eliminar contactos",

  // Inventory
  "inventory.view": "Ver inventario",
  "inventory.create": "Crear productos",
  "inventory.edit": "Editar productos",
  "inventory.adjust": "Ajustar inventario",

  // Reports
  "reports.view": "Ver reportes",
  "reports.export": "Exportar reportes",
  "reports.financial": "Reportes financieros",

  // AI Assistant
  "ai.chat": "Usar asistente IA",

  // Settings
  "settings.view": "Ver configuración",
  "settings.edit": "Editar configuración",

  // Budgets
  "budgets.view": "Ver presupuestos",
  "budgets.create": "Crear presupuestos",
  "budgets.edit": "Editar presupuestos",

  // Fixed Assets
  "assets.view": "Ver activos fijos",
  "assets.create": "Crear activos fijos",
  "assets.edit": "Editar activos fijos",
  "assets.depreciate": "Ejecutar depreciación",

  // Audit
  "audit.view": "Ver bitácora de auditoría",

  // Notifications
  "notifications.view": "Ver notificaciones",
  "notifications.manage": "Gestionar notificaciones",
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: Object.keys(PERMISSIONS) as Permission[],

  accountant: [
    "org.view",
    "org.members.view",
    "fel.view", "fel.create", "fel.edit", "fel.void", "fel.export",
    "expenses.view", "expenses.create", "expenses.edit", "expenses.approve",
    "accounts.view", "accounts.create", "accounts.edit",
    "journal.view", "journal.create", "journal.edit",
    "payroll.view", "payroll.create", "payroll.edit", "payroll.approve",
    "payroll.employees.view", "payroll.employees.create", "payroll.employees.edit",
    "tax.view", "tax.create", "tax.file",
    "banking.view", "banking.create", "banking.reconcile", "banking.transactions",
    "contacts.view", "contacts.create", "contacts.edit",
    "inventory.view", "inventory.create", "inventory.edit", "inventory.adjust",
    "reports.view", "reports.export", "reports.financial",
    "ai.chat",
    "settings.view",
    "budgets.view", "budgets.create", "budgets.edit",
    "assets.view", "assets.create", "assets.edit", "assets.depreciate",
    "audit.view",
    "notifications.view",
  ],

  employee: [
    "org.view",
    "fel.view",
    "expenses.view", "expenses.create",
    "contacts.view",
    "inventory.view",
    "reports.view",
    "ai.chat",
    "notifications.view",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    admin: "Administrador",
    accountant: "Contador",
    employee: "Empleado",
  };
  return labels[role] || role;
}
