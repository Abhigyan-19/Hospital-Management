import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../api/adminService';
import { apiErrorMessage } from '../api/errorMessage';
import { isDemoMode } from '../api/demoAuth';
import { Badge, Button, Card, ConfirmDialog, EmptyState, SearchBox, Skeleton } from '../components/ui';

const pageSize = 10;

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [roleTarget, setRoleTarget] = useState(null);

  const loadUsers = () => {
    setLoading(true);
    setError('');
    adminService.listUsers()
      .then(setUsers)
      .catch((requestError) => {
        const message = isDemoMode()
          ? requestError.message || 'Unable to load user accounts.'
          : apiErrorMessage(requestError, 'Backend not connected. User management is unavailable.');
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const filtered = useMemo(() => users.filter((item) =>
    `${item.name} ${item.email} ${item.role}`.toLowerCase().includes(search.trim().toLowerCase()),
  ), [users, search]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleUsers = filtered.slice((page - 1) * pageSize, page * pageSize);

  const changeStatus = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await adminService.setUserActive(selected.id, !selected.active);
      setUsers((current) => current.map((item) => Number(item.id) === Number(updated.id) ? updated : item));
      toast.success(`${updated.name} account ${updated.active ? 'activated' : 'deactivated'}.`);
      setSelected(null);
    } catch (requestError) {
      const message = isDemoMode()
        ? requestError.message || 'The account status could not be changed.'
        : apiErrorMessage(requestError, 'Backend not connected. The account status was not changed.');
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async () => {
    if (!roleTarget) return;
    setSaving(true);
    try {
      const updated = await adminService.setUserRole(roleTarget.user.id, roleTarget.role);
      setUsers((current) => current.map((item) => Number(item.id) === Number(updated.id) ? updated : item));
      toast.success(`${updated.name} role changed to ${updated.role}.`);
      setRoleTarget(null);
    } catch (requestError) {
      const message = isDemoMode()
        ? requestError.message || 'The account role could not be changed.'
        : apiErrorMessage(requestError, 'Backend not connected. The account role was not changed.');
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <header><p className="font-bold text-teal-700">Access control</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Users & roles</h2><p className="mt-2 text-navy-700">Review account roles and activate or deactivate access. Roles are assigned during account provisioning.</p></header>
      {error && <Card role="alert" className="border-red-200 bg-red-50"><p className="font-bold text-danger">{error}</p><Button variant="secondary" className="mt-4" onClick={loadUsers} disabled={loading}>Try again</Button></Card>}
      <Card><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h3 className="text-xl font-extrabold">Account directory</h3><p className="mt-1 text-sm text-navy-700">{loading ? 'Loading accounts…' : `${filtered.length} accounts`}</p></div><div className="w-full sm:max-w-sm"><SearchBox value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name, email or role" /></div></div>
        {loading ? <div className="mt-5 space-y-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-14 w-full" />)}</div> : !error && !filtered.length ? <div className="mt-5"><EmptyState title="No accounts found">Try a different search term.</EmptyState></div> : !error && <>
          <div className="responsive-table mt-5 overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead><tr className="border-b border-navy-100 text-sm text-navy-500"><th className="px-3 py-3">Account</th><th className="px-3 py-3">Role</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Access</th></tr></thead>
              <tbody>{visibleUsers.map((item) => <tr key={item.id} className="border-b border-navy-100 last:border-0">
                <td data-label="Account" className="px-3 py-4"><p className="font-extrabold">{item.name}</p><p className="mt-1 text-sm text-navy-700">{item.email}</p></td>
                <td data-label="Role" className="px-3 py-4"><label className="sr-only" htmlFor={`role-${item.id}`}>Role for {item.name}</label><select id={`role-${item.id}`} value={item.role} disabled={saving || Number(item.id) === Number(currentUser?.id)} onChange={(event) => event.target.value !== item.role && setRoleTarget({ user: item, role: event.target.value })} className="min-h-11 rounded-lg border border-navy-100 bg-white px-3 font-bold disabled:bg-navy-50">{['ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST'].map((role) => <option key={role} value={role}>{role}</option>)}</select></td>
                <td data-label="Status" className="px-3 py-4"><Badge tone={item.active ? 'success' : 'danger'}>{item.active ? 'Active' : 'Inactive'}</Badge></td>
                <td data-label="Access" className="px-3 py-4"><Button variant={item.active ? 'danger' : 'secondary'} disabled={saving || Number(item.id) === Number(currentUser?.id)} onClick={() => setSelected(item)}>{item.active ? 'Deactivate' : 'Activate'}</Button>{Number(item.id) === Number(currentUser?.id) && <span className="ml-2 text-sm text-navy-700">Current account</span>}</td>
              </tr>)}</tbody>
            </table>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-bold text-navy-700">Page {page} of {pageCount}</p><div className="flex gap-2"><Button variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button><Button variant="secondary" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</Button></div></div>
        </>}
      </Card>
      <ConfirmDialog open={Boolean(selected)} title={selected?.active ? 'Deactivate this account?' : 'Activate this account?'} message={selected ? `${selected.active ? 'Deactivate' : 'Activate'} ${selected.name} (${selected.email})? ${selected.active ? 'They will not be able to sign in.' : 'They will be able to sign in again.'}` : ''} confirmLabel={selected?.active ? 'Deactivate account' : 'Activate account'} confirmDisabled={saving} onClose={() => !saving && setSelected(null)} onConfirm={changeStatus} />
      <ConfirmDialog open={Boolean(roleTarget)} title="Change this account role?" message={roleTarget ? `Change ${roleTarget.user.name} from ${roleTarget.user.role} to ${roleTarget.role}? Access and data permissions will change.` : ''} confirmLabel="Change role" confirmDisabled={saving} onClose={() => !saving && setRoleTarget(null)} onConfirm={changeRole} />
    </div>
  );
}
