import UserManagement from '@/components/views/UserManagement';
import RoleGuard from '@/components/RoleGuard';

export default function UserManagementPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="h-full w-full overflow-y-auto">
        <UserManagement />
      </div>
    </RoleGuard>
  );
}
