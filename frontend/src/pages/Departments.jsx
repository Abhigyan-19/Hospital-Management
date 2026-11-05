import { useEffect, useState } from 'react';
import { Building2, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { departmentService } from '../api/departmentService';
import { Button, Card, EmptyState, Input, Modal } from '../components/ui';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', headDoctor: '', description: '' });

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentService.list();
      setDepartments(data || []);
    } catch (error) {
      toast.error('Failed to load departments from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.headDoctor.trim() || !form.description.trim()) {
      return toast.error('Please complete all department fields.');
    }
    try {
      const created = await departmentService.create(form);
      setDepartments((current) => [...current, created]);
      setForm({ name: '', headDoctor: '', description: '' });
      setOpen(false);
      toast.success('Department added successfully.');
    } catch (error) {
      toast.error('Failed to save department.');
    }
  };

  const removeDepartment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await departmentService.remove(id);
      setDepartments((current) => current.filter((d) => d.id !== id));
      toast.success('Department deleted.');
    } catch (error) {
      toast.error('Failed to delete department.');
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-bold text-teal-700">Hospital structure</p>
          <h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Departments & Services</h2>
          <p className="mt-2 text-navy-700">Manage specialized departments and medical clinical units.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={19} />
          Add department
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center font-bold text-navy-500">Loading departments...</div>
      ) : departments.length === 0 ? (
        <EmptyState title="No departments yet">Add your first department to get started.</EmptyState>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((department) => (
            <Card key={department.id} className="relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-100 text-teal-700">
                    <Building2 size={24} />
                  </span>
                  <button
                    onClick={() => removeDepartment(department.id)}
                    className="rounded-lg p-2 text-navy-400 hover:bg-danger/10 hover:text-danger"
                    title="Delete department"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="mt-5 text-xl font-extrabold">{department.name}</h3>
                <p className="mt-2 leading-7 text-navy-700">{department.description}</p>
              </div>
              <div className="mt-5 border-t border-navy-100 pt-4">
                <p className="text-sm font-bold text-navy-500">Department head</p>
                <p className="mt-1 font-extrabold">{department.headDoctor}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold">Active Hospital Clinical Services</h3>
            <p className="mt-1 text-navy-700">Clinical wings operating across active hospital departments.</p>
          </div>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-extrabold text-teal-700">
            Active Wings
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-navy-50 p-4 font-extrabold">Outpatient Consultations</div>
          <div className="rounded-xl bg-navy-50 p-4 font-extrabold">Diagnostic & Radiology Imaging</div>
          <div className="rounded-xl bg-navy-50 p-4 font-extrabold">Inpatient & Emergency Care</div>
        </div>
      </Card>

      <Modal open={open} title="Add department" onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Department name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="e.g. Cardiology"
          />
          <Input
            label="Head doctor"
            value={form.headDoctor}
            onChange={(event) => setForm({ ...form, headDoctor: event.target.value })}
            placeholder="e.g. Dr. Arvind Sharma"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="Describe clinical care area"
          />
          <Button type="submit" className="w-full">
            Save department
          </Button>
        </form>
      </Modal>
    </div>
  );
}
