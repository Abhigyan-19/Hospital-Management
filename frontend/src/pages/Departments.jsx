import { useEffect, useState } from 'react';
import { Building2, Pencil, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../api/adminService';
import { apiErrorMessage } from '../api/errorMessage';
import { isDemoMode } from '../api/demoAuth';
import { departmentService } from '../api/departmentService';
import { Button, Card, EmptyState, Input, Modal, SearchBox, Skeleton } from '../components/ui';

const emptyDepartment = { name: '', headDoctor: '', description: '' };
const emptyService = { name: '', departmentId: '', price: '' };
const servicePageSize = 8;

function messageFor(error, fallback) {
  return isDemoMode() ? error.message || fallback : apiErrorMessage(error, `Backend not connected. ${fallback}`);
}

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [departmentError, setDepartmentError] = useState('');
  const [serviceError, setServiceError] = useState('');
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  const [servicePage, setServicePage] = useState(1);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [departmentForm, setDepartmentForm] = useState(emptyDepartment);
  const [serviceForm, setServiceForm] = useState(emptyService);
  const filteredServices = services.filter((service) =>
    `${service.name} ${service.departmentName || ''}`.toLowerCase().includes(serviceSearch.trim().toLowerCase()),
  );
  const servicePageCount = Math.max(1, Math.ceil(filteredServices.length / servicePageSize));
  const visibleServices = filteredServices.slice((servicePage - 1) * servicePageSize, servicePage * servicePageSize);

  const loadDepartments = () => {
    setDepartmentsLoading(true);
    setDepartmentError('');
    departmentService.list()
      .then(setDepartments)
      .catch((error) => {
        const message = messageFor(error, 'Department information could not be loaded.');
        setDepartmentError(message);
        toast.error(message);
      })
      .finally(() => setDepartmentsLoading(false));
  };

  const loadServices = () => {
    setServicesLoading(true);
    setServiceError('');
    adminService.listServices()
      .then(setServices)
      .catch((error) => {
        const message = messageFor(error, 'Hospital services are unavailable.');
        setServiceError(message);
        toast.error(message);
      })
      .finally(() => setServicesLoading(false));
  };

  useEffect(() => {
    loadDepartments();
    loadServices();
  }, []);

  const submitDepartment = async (event) => {
    event.preventDefault();
    if (!departmentForm.name.trim() || !departmentForm.description.trim()) {
      toast.error('Enter a department name and description.');
      return;
    }
    setSaving(true);
    try {
      const created = await departmentService.create(departmentForm);
      setDepartments((current) => [...current, created]);
      setDepartmentForm(emptyDepartment);
      setDepartmentOpen(false);
      toast.success('Department added.');
    } catch (error) {
      const message = messageFor(error, 'The department was not saved.');
      setDepartmentError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const openNewService = () => {
    setEditingServiceId(null);
    setServiceForm({ ...emptyService, departmentId: departments[0]?.id ?? '' });
    setServiceOpen(true);
  };

  const openEditService = (service) => {
    setEditingServiceId(service.id);
    setServiceForm({ name: service.name, departmentId: service.departmentId ?? '', price: String(service.price) });
    setServiceOpen(true);
  };

  const submitService = async (event) => {
    event.preventDefault();
    if (!serviceForm.name.trim() || !serviceForm.departmentId || !Number.isFinite(Number(serviceForm.price)) || Number(serviceForm.price) <= 0) {
      toast.error('Enter a service name, department, and price greater than zero.');
      return;
    }
    setSaving(true);
    try {
      const saved = await adminService.saveService({
        ...serviceForm,
        departmentId: Number(serviceForm.departmentId),
        price: Number(serviceForm.price),
      }, editingServiceId);
      setServices((current) => editingServiceId
        ? current.map((item) => Number(item.id) === Number(saved.id) ? saved : item)
        : [...current, saved]);
      setServiceSearch('');
      setServicePage(1);
      setServiceOpen(false);
      toast.success(editingServiceId ? 'Service updated.' : 'Service added.');
    } catch (error) {
      const message = messageFor(error, 'The service was not saved.');
      setServiceError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="font-bold text-teal-700">Hospital structure</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Departments & services</h2><p className="mt-2 text-navy-700">Maintain care areas and their published service prices.</p></div><Button onClick={() => setDepartmentOpen(true)}><Plus size={19} />Add department</Button></div>
      {departmentError && <Card role="alert" className="border-red-200 bg-red-50"><p className="font-bold text-danger">{departmentError}</p><Button variant="secondary" className="mt-4" onClick={loadDepartments} disabled={departmentsLoading}>Retry departments</Button></Card>}
      {departmentsLoading ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <Card key={item}><Skeleton className="h-36 w-full" /></Card>)}</div> : !departmentError && !departments.length ? <EmptyState title="No departments yet">Add the first department to start organizing services.</EmptyState> : !departmentError && <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{departments.map((department) => <Card key={department.id}><span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-100 text-teal-700"><Building2 size={24} /></span><h3 className="mt-5 text-xl font-extrabold">{department.name}</h3><p className="mt-2 leading-7 text-navy-700">{department.description}</p><div className="mt-5 border-t border-navy-100 pt-4"><p className="text-sm font-bold text-navy-500">Department head</p><p className="mt-1 font-extrabold">{department.headDoctor || 'Not listed'}</p></div></Card>)}</div>}
      <Card><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="text-xl font-extrabold">Services and prices</h3><p className="mt-1 text-navy-700">Maintain the service catalog shown to hospital teams.</p></div><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="w-full sm:w-64"><SearchBox value={serviceSearch} onChange={(event) => { setServiceSearch(event.target.value); setServicePage(1); }} placeholder="Search services" /></div><Button onClick={openNewService} disabled={departmentsLoading || !departments.length}><Plus size={18} />Add service</Button></div></div>
        {serviceError && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4"><p className="font-bold text-danger">{serviceError}</p><Button variant="secondary" className="mt-4" onClick={loadServices} disabled={servicesLoading}>Retry services</Button></div>}
        {servicesLoading ? <div className="mt-5 space-y-3">{[1, 2].map((item) => <Skeleton key={item} className="h-14 w-full" />)}</div> : !serviceError && !filteredServices.length ? <div className="mt-5"><EmptyState title={serviceSearch ? 'No matching services' : 'No services listed'}>{serviceSearch ? 'Try another service or department search.' : 'Add a service with its department and current price.'}</EmptyState></div> : !serviceError && <>
        <div className="responsive-table mt-5 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead><tr className="border-b border-navy-100 text-sm text-navy-500"><th className="px-3 py-3">Service</th><th className="px-3 py-3">Department</th><th className="px-3 py-3">Price</th><th className="px-3 py-3">Action</th></tr></thead>
            <tbody>{visibleServices.map((service) => <tr key={service.id} className="border-b border-navy-100 last:border-0">
              <td data-label="Service" className="px-3 py-4 font-extrabold">{service.name}</td>
              <td data-label="Department" className="px-3 py-4">{service.departmentName || departments.find((item) => Number(item.id) === Number(service.departmentId))?.name || 'Not assigned'}</td>
              <td data-label="Price" className="px-3 py-4 font-bold">₹{Number(service.price).toLocaleString('en-IN')}</td>
              <td data-label="Action" className="px-3 py-4"><Button variant="secondary" onClick={() => openEditService(service)}><Pencil size={17} />Edit</Button></td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-bold text-navy-700">{filteredServices.length} services · Page {servicePage} of {servicePageCount}</p><div className="flex gap-2"><Button variant="secondary" disabled={servicePage <= 1} onClick={() => setServicePage((value) => Math.max(1, value - 1))}>Previous</Button><Button variant="secondary" disabled={servicePage >= servicePageCount} onClick={() => setServicePage((value) => Math.min(servicePageCount, value + 1))}>Next</Button></div></div>
        </>}
      </Card>
      <Modal open={departmentOpen} title="Add department" onClose={() => !saving && setDepartmentOpen(false)}><form onSubmit={submitDepartment} className="space-y-4"><Input label="Department name" required value={departmentForm.name} onChange={(event) => setDepartmentForm({ ...departmentForm, name: event.target.value })} placeholder="General medicine" /><Input label="Department head (optional)" value={departmentForm.headDoctor} onChange={(event) => setDepartmentForm({ ...departmentForm, headDoctor: event.target.value })} placeholder="Dr. Full Name" /><Input label="Description" required value={departmentForm.description} onChange={(event) => setDepartmentForm({ ...departmentForm, description: event.target.value })} placeholder="Describe this care area" /><Button type="submit" className="w-full" disabled={saving}>{saving ? 'Saving…' : 'Save department'}</Button></form></Modal>
      <Modal open={serviceOpen} title={editingServiceId ? 'Edit service and price' : 'Add hospital service'} onClose={() => !saving && setServiceOpen(false)}><form onSubmit={submitService} className="space-y-4"><Input label="Service name" required value={serviceForm.name} onChange={(event) => setServiceForm({ ...serviceForm, name: event.target.value })} placeholder="Outpatient consultation" /><label className="block"><span className="mb-2 block font-bold">Department</span><select required value={serviceForm.departmentId} onChange={(event) => setServiceForm({ ...serviceForm, departmentId: event.target.value })} className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4"><option value="">Choose a department</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label><Input label="Price (₹)" required type="number" min="0.01" step="0.01" value={serviceForm.price} onChange={(event) => setServiceForm({ ...serviceForm, price: event.target.value })} /><Button type="submit" className="w-full" disabled={saving}>{saving ? 'Saving…' : editingServiceId ? 'Save service' : 'Add service'}</Button></form></Modal>
    </div>
  );
}
