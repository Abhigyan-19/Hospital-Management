import { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  Building2,
  Check,
  Plus,
  Trash2,
  UserRound,
  Wrench,
} from "lucide-react";
import toast from "react-hot-toast";
import { bedService } from "../api/bedService";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Input,
  Modal,
  SearchBox,
  Skeleton,
} from "../components/ui";

const emptyWard = { name: "", department: "", floor: "0" };
const emptyBed = { bedNumber: "", wardId: "" };
const fieldClass =
  "min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4 text-ink outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100";
const errorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

const statusLabel = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  MAINTENANCE: "Maintenance",
};
const statusTone = {
  AVAILABLE: "success",
  OCCUPIED: "info",
  MAINTENANCE: "warning",
};

export default function Beds() {
  const [beds, setBeds] = useState([]);
  const [wards, setWards] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [wardOpen, setWardOpen] = useState(false);
  const [bedOpen, setBedOpen] = useState(false);
  const [assigningBed, setAssigningBed] = useState(null);
  const [wardToDelete, setWardToDelete] = useState(null);
  const [bedToDelete, setBedToDelete] = useState(null);
  const [wardForm, setWardForm] = useState(emptyWard);
  const [bedForm, setBedForm] = useState(emptyBed);
  const [patientId, setPatientId] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [nextBeds, nextWards, nextPatients] = await Promise.all([
        bedService.listBeds(),
        bedService.listWards(),
        bedService.listPatients(),
      ]);
      setBeds(nextBeds);
      setWards(nextWards);
      setPatients(nextPatients);
    } catch (error) {
      toast.error(errorMessage(error, "Unable to load beds and wards."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBeds = useMemo(
    () =>
      beds.filter((bed) => {
        const matchesStatus =
          statusFilter === "ALL" || bed.status === statusFilter;
        const matchesSearch =
          `${bed.bedNumber} ${bed.wardName} ${bed.patientName || ""}`
            .toLowerCase()
            .includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
      }),
    [beds, search, statusFilter],
  );

  const summary = {
    total: beds.length,
    available: beds.filter((bed) => bed.status === "AVAILABLE").length,
    occupied: beds.filter((bed) => bed.status === "OCCUPIED").length,
    maintenance: beds.filter((bed) => bed.status === "MAINTENANCE").length,
  };

  const submitWard = async (event) => {
    event.preventDefault();
    try {
      const created = await bedService.createWard({
        ...wardForm,
        floor: Number(wardForm.floor),
      });
      setWards((current) => [...current, created]);
      setWardForm(emptyWard);
      setWardOpen(false);
      toast.success("Ward created.");
    } catch (error) {
      toast.error(errorMessage(error, "Unable to create ward."));
    }
  };

  const submitBed = async (event) => {
    event.preventDefault();
    try {
      const created = await bedService.createBed({
        ...bedForm,
        wardId: Number(bedForm.wardId),
      });
      setBeds((current) => [...current, created]);
      setBedForm(emptyBed);
      setBedOpen(false);
      toast.success("Bed added to ward.");
    } catch (error) {
      toast.error(errorMessage(error, "Unable to create bed."));
    }
  };

  const assignPatient = async (event) => {
    event.preventDefault();
    if (!patientId) return toast.error("Select a patient to assign.");
    try {
      const updated = await bedService.assignPatient(
        assigningBed.id,
        Number(patientId),
      );
      setBeds((current) =>
        current.map((bed) => (bed.id === updated.id ? updated : bed)),
      );
      setAssigningBed(null);
      setPatientId("");
      toast.success("Patient assigned to bed.");
    } catch (error) {
      toast.error(errorMessage(error, "Unable to assign patient."));
    }
  };

  const releaseBed = async (bed) => {
    try {
      const updated = await bedService.releaseBed(bed.id);
      setBeds((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success("Bed released and now available.");
    } catch (error) {
      toast.error(errorMessage(error, "Unable to release bed."));
    }
  };

  const toggleMaintenance = async (bed) => {
    const status = bed.status === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";
    try {
      const updated = await bedService.updateStatus(bed.id, status);
      setBeds((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success(
        status === "MAINTENANCE"
          ? "Bed marked for maintenance."
          : "Bed marked available.",
      );
    } catch (error) {
      toast.error(errorMessage(error, "Unable to update bed status."));
    }
  };

  const removeBed = async () => {
    try {
      await bedService.removeBed(bedToDelete.id);
      setBeds((current) => current.filter((bed) => bed.id !== bedToDelete.id));
      setBedToDelete(null);
      toast.success("Bed removed.");
    } catch (error) {
      toast.error(errorMessage(error, "Unable to remove bed."));
    }
  };

  const removeWard = async () => {
    try {
      await bedService.removeWard(wardToDelete.id);
      setWards((current) =>
        current.filter((ward) => ward.id !== wardToDelete.id),
      );
      setWardToDelete(null);
      toast.success("Ward removed.");
    } catch (error) {
      toast.error(errorMessage(error, "Unable to remove ward."));
    }
  };

  const openBedForm = (wardId = "") => {
    setBedForm({ ...emptyBed, wardId: wardId ? String(wardId) : "" });
    setBedOpen(true);
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-bold text-teal-700">Capacity management</p>
          <h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">
            Beds &amp; wards
          </h2>
          <p className="mt-2 text-navy-700">
            Manage ward capacity and live patient occupancy.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setWardOpen(true)}>
            <Building2 size={18} />
            Add ward
          </Button>
          <Button onClick={() => openBedForm()} disabled={wards.length === 0}>
            <Plus size={19} />
            Add bed
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total beds", summary.total, BedDouble],
          ["Available", summary.available, Check],
          ["Occupied", summary.occupied, UserRound],
          ["Maintenance", summary.maintenance, Wrench],
        ].map(([label, value, Icon]) => (
          <Card key={label} className="flex items-center gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <Icon size={21} />
            </span>
            <div>
              <p className="text-sm font-bold text-navy-700">{label}</p>
              <p className="text-2xl font-black text-ink">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold text-ink">Wards</h3>
            <p className="mt-1 text-sm text-navy-700">
              Capacity is calculated from registered beds.
            </p>
          </div>
          <span className="text-sm font-bold text-navy-700">
            {wards.length} wards
          </span>
        </div>
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Card key={item}>
                <Skeleton className="h-24 w-full" />
              </Card>
            ))}
          </div>
        ) : wards.length === 0 ? (
          <EmptyState title="No wards registered">
            Add a ward to start tracking its beds.
          </EmptyState>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {wards.map((ward) => {
              const wardBeds = beds.filter((bed) => bed.wardId === ward.id);
              const occupied = wardBeds.filter(
                (bed) => bed.status === "OCCUPIED",
              ).length;
              const available = wardBeds.filter(
                (bed) => bed.status === "AVAILABLE",
              ).length;
              return (
                <Card key={ward.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-extrabold text-ink">{ward.name}</h4>
                      <p className="mt-1 text-sm text-navy-700">
                        {ward.department} · Floor {ward.floor}
                      </p>
                    </div>
                    <button
                      className="rounded-lg p-2 text-navy-500 hover:bg-red-50 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
                      title={
                        wardBeds.length
                          ? "Remove beds before deleting this ward"
                          : "Delete ward"
                      }
                      aria-label={`Delete ${ward.name}`}
                      disabled={wardBeds.length > 0}
                      onClick={() => setWardToDelete(ward)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span>
                      <b>{wardBeds.length}</b> beds
                    </span>
                    <span className="text-success">
                      <b>{available}</b> available
                    </span>
                    <span className="text-navy-700">
                      <b>{occupied}</b> occupied
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    className="mt-3 px-2"
                    onClick={() => openBedForm(ward.id)}
                  >
                    <Plus size={16} />
                    Add bed
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Card>
        <div className="flex flex-col justify-between gap-4 border-b border-navy-100 pb-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xl font-extrabold">Bed register</h3>
            <p className="mt-1 text-sm text-navy-700">
              {filteredBeds.length} of {beds.length} beds
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="w-full sm:w-64">
              <SearchBox
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search beds, wards, patients"
              />
            </div>
            <select
              aria-label="Filter by bed status"
              className={fieldClass}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="space-y-3 py-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : filteredBeds.length === 0 ? (
          <div className="py-8">
            <EmptyState title="No beds found">
              Add a bed or adjust the current search and status filter.
            </EmptyState>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-navy-100 text-sm text-navy-500">
                  <th className="px-3 py-3">Bed</th>
                  <th className="px-3 py-3">Ward</th>
                  <th className="px-3 py-3">Patient</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBeds.map((bed) => (
                  <tr
                    key={bed.id}
                    className="border-b border-navy-100 last:border-0"
                  >
                    <td className="px-3 py-4 font-extrabold">
                      {bed.bedNumber}
                    </td>
                    <td className="px-3 py-4">{bed.wardName}</td>
                    <td className="px-3 py-4">
                      {bed.patientName || (
                        <span className="text-navy-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <Badge tone={statusTone[bed.status]}>
                        {statusLabel[bed.status]}
                      </Badge>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex justify-end gap-1">
                        {bed.status === "AVAILABLE" && (
                          <>
                            <Button
                              variant="secondary"
                              className="min-h-9 px-3 text-sm"
                              onClick={() => {
                                setAssigningBed(bed);
                                setPatientId("");
                              }}
                            >
                              <UserRound size={15} />
                              Assign
                            </Button>
                            <Button
                              variant="ghost"
                              className="min-h-9 px-3 text-sm"
                              onClick={() => toggleMaintenance(bed)}
                            >
                              <Wrench size={15} />
                              Service
                            </Button>
                          </>
                        )}
                        {bed.status === "OCCUPIED" && (
                          <Button
                            variant="secondary"
                            className="min-h-9 px-3 text-sm"
                            onClick={() => releaseBed(bed)}
                          >
                            Release
                          </Button>
                        )}
                        {bed.status === "MAINTENANCE" && (
                          <Button
                            variant="secondary"
                            className="min-h-9 px-3 text-sm"
                            onClick={() => toggleMaintenance(bed)}
                          >
                            <Check size={15} />
                            Available
                          </Button>
                        )}
                        {bed.status !== "OCCUPIED" && (
                          <button
                            className="rounded-lg p-2 text-navy-500 hover:bg-red-50 hover:text-danger"
                            aria-label={`Delete bed ${bed.bedNumber}`}
                            onClick={() => setBedToDelete(bed)}
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={wardOpen}
        title="Add ward"
        onClose={() => setWardOpen(false)}
      >
        <form className="space-y-4" onSubmit={submitWard}>
          <Input
            label="Ward name"
            value={wardForm.name}
            onChange={(event) =>
              setWardForm({ ...wardForm, name: event.target.value })
            }
            placeholder="e.g. Ward A"
            required
          />
          <Input
            label="Department"
            value={wardForm.department}
            onChange={(event) =>
              setWardForm({ ...wardForm, department: event.target.value })
            }
            placeholder="e.g. Cardiology"
            required
          />
          <Input
            label="Floor"
            type="number"
            min="0"
            value={wardForm.floor}
            onChange={(event) =>
              setWardForm({ ...wardForm, floor: event.target.value })
            }
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setWardOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus size={17} />
              Create ward
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={bedOpen} title="Add bed" onClose={() => setBedOpen(false)}>
        <form className="space-y-4" onSubmit={submitBed}>
          <Input
            label="Bed number"
            value={bedForm.bedNumber}
            onChange={(event) =>
              setBedForm({ ...bedForm, bedNumber: event.target.value })
            }
            placeholder="e.g. A-01"
            required
          />
          <label className="block">
            <span className="mb-2 block font-bold text-ink">Ward</span>
            <select
              className={fieldClass}
              value={bedForm.wardId}
              onChange={(event) =>
                setBedForm({ ...bedForm, wardId: event.target.value })
              }
              required
            >
              <option value="">Select a ward</option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.name} · {ward.department}
                </option>
              ))}
            </select>
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setBedOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus size={17} />
              Create bed
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(assigningBed)}
        title={`Assign ${assigningBed?.bedNumber || "bed"}`}
        onClose={() => setAssigningBed(null)}
      >
        <form className="space-y-4" onSubmit={assignPatient}>
          <label className="block">
            <span className="mb-2 block font-bold text-ink">Patient</span>
            <select
              className={fieldClass}
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
              required
            >
              <option value="">Select a registered patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} · #{patient.id}
                </option>
              ))}
            </select>
          </label>
          {patients.length === 0 && (
            <p className="text-sm text-warning">
              Register a patient before assigning a bed.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAssigningBed(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={patients.length === 0}>
              <UserRound size={17} />
              Assign patient
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(wardToDelete)}
        title="Delete ward?"
        message={`Delete ${wardToDelete?.name || "this ward"}? Wards with beds cannot be deleted.`}
        onClose={() => setWardToDelete(null)}
        onConfirm={removeWard}
      />
      <ConfirmDialog
        open={Boolean(bedToDelete)}
        title="Delete bed?"
        message={`Remove bed ${bedToDelete?.bedNumber || ""} from the register?`}
        onClose={() => setBedToDelete(null)}
        onConfirm={removeBed}
      />
    </div>
  );
}
