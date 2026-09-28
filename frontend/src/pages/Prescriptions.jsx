import { useEffect, useState } from 'react';
import { FileText, Plus, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

import { prescriptionService } from '../api/prescriptionService';
import { patientService } from '../api/patientService';
import { doctorService } from '../api/doctorService';

import {
    Button,
    Card,
    EmptyState,
    Input,
    Modal
} from '../components/ui';

export default function Prescriptions() {

    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const [form, setForm] = useState({
        patientId: '',
        doctorId: '',
        medicine: '',
        dosage: '',
        frequency: 'Once daily',
        duration: '',
        notes: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [
                prescriptionData,
                patientData,
                doctorData
            ] = await Promise.all([
                prescriptionService.list(),
                patientService.list(),
                doctorService.list()
            ]);

            setPrescriptions(prescriptionData);
            setPatients(patientData);
            setDoctors(doctorData);

        } catch (error) {
            console.error('Failed to load prescription data:', error);

            toast.error(
                'Failed to load prescription data.'
            );
        }
    };

    const handlePatientChange = (event) => {

        const patientId = event.target.value;

        setForm((current) => ({
            ...current,
            patientId
        }));

        /*
         * If the backend returns assignedDoctor with the patient,
         * automatically select that doctor.
         *
         * Example patient response:
         *
         * {
         *     "id": 1,
         *     "name": "Rahul",
         *     "assignedDoctor": {
         *         "id": 3,
         *         "name": "Dr. Amit"
         *     }
         * }
         */

        const selectedPatient = patients.find(
            (patient) => patient.id === Number(patientId)
        );

        if (selectedPatient?.assignedDoctor) {

            setForm((current) => ({
                ...current,
                patientId,
                doctorId: String(
                    selectedPatient.assignedDoctor.id
                )
            }));
        }
    };

    const submit = async (event) => {

        event.preventDefault();

        if (
            !form.patientId ||
            !form.doctorId ||
            !form.medicine.trim() ||
            !form.dosage.trim() ||
            !form.duration.trim()
        ) {
            toast.error(
                'Please complete the prescription fields.'
            );

            return;
        }

        try {

            const prescription = {
                patientId: Number(form.patientId),
                doctorId: Number(form.doctorId),
                notes: form.notes,
                medicines: [
                    {
                        name: form.medicine,
                        dosage: form.dosage,
                        frequency: form.frequency,
                        duration: form.duration
                    }
                ]
            };

            const created =
                await prescriptionService.create(
                    prescription
                );

            setPrescriptions((current) => [
                created,
                ...current
            ]);

            resetForm();

            setOpen(false);

            toast.success(
                'Prescription created successfully.'
            );

        } catch (error) {

            console.error(
                'Failed to create prescription:',
                error
            );

            if (error.response?.status === 403) {

                toast.error(
                    'The selected doctor is not assigned to this patient.'
                );

            } else if (error.response?.status === 404) {

                toast.error(
                    error.response?.data?.message ||
                    'Patient or doctor not found.'
                );

            } else {

                toast.error(
                    error.response?.data?.message ||
                    'Failed to create prescription.'
                );
            }
        }
    };

    const resetForm = () => {

        setForm({
            patientId: '',
            doctorId: '',
            medicine: '',
            dosage: '',
            frequency: 'Once daily',
            duration: '',
            notes: ''
        });
    };

    const handleCloseCreateModal = () => {
        setOpen(false);
        resetForm();
    };

    const selectedPatient = patients.find(
        (patient) =>
            patient.id === Number(form.patientId)
    );

    const selectedDoctor = doctors.find(
        (doctor) =>
            doctor.id === Number(form.doctorId)
    );

    return (
        <div className="mx-auto max-w-[1200px] space-y-6">

            {/* Header */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                <div>

                    <p className="font-bold text-teal-700">
                        Medication management
                    </p>

                    <h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">
                        Prescriptions
                    </h2>

                    <p className="mt-2 text-navy-700">
                        Create clear medication instructions and keep them easy to review.
                    </p>

                </div>

                <Button onClick={() => setOpen(true)}>
                    <Plus size={19} />
                    Create prescription
                </Button>

            </div>


            {/* Prescription List */}

            {prescriptions.length === 0 ? (

                <EmptyState title="No prescriptions yet">
                    Create a prescription to see it here.
                </EmptyState>

            ) : (

                <div className="space-y-4">

                    {prescriptions.map((prescription) => (

                        <Card key={prescription.id}>

                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                                <div className="flex gap-4">

                                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-teal-100 text-teal-700">
                                        <FileText size={23} />
                                    </span>

                                    <div>

                                        <h3 className="text-xl font-extrabold">
                                            {prescription.patient?.name ||
                                                prescription.patient}
                                        </h3>

                                        <p className="mt-1 text-sm text-navy-700">

                                            Prescribed by{' '}

                                            {prescription.doctor?.name ||
                                                prescription.doctor}

                                            {' · '}

                                            {prescription.createdAt}

                                        </p>

                                    </div>

                                </div>


                                <div className="flex gap-2">

                                    <Button
                                        variant="secondary"
                                        className="px-3"
                                        onClick={() =>
                                            setSelected(prescription)
                                        }
                                    >
                                        View
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        className="px-3"
                                        onClick={() =>
                                            window.print()
                                        }
                                    >
                                        <Printer size={17} />
                                        Print
                                    </Button>

                                </div>

                            </div>


                            {/* Medicines */}

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">

                                {prescription.medicines?.map(
                                    (medicine) => (

                                        <div
                                            key={medicine.id || medicine.name}
                                            className="rounded-xl bg-navy-50 p-4"
                                        >

                                            <p className="font-extrabold">
                                                {medicine.name}
                                                {' · '}
                                                {medicine.dosage}
                                            </p>

                                            <p className="mt-1 text-sm font-bold text-navy-700">
                                                {medicine.frequency}
                                                {' for '}
                                                {medicine.duration}
                                            </p>

                                        </div>

                                    )
                                )}

                            </div>


                            {/* Notes */}

                            {prescription.notes && (

                                <p className="mt-4 text-sm font-bold text-navy-700">

                                    Notes: {prescription.notes}

                                </p>

                            )}

                        </Card>

                    ))}

                </div>

            )}


            {/* Create Prescription Modal */}

            <Modal
                open={open}
                title="Create prescription"
                onClose={handleCloseCreateModal}
            >

                <form
                    onSubmit={submit}
                    className="space-y-4"
                >

                    {/* Patient */}

                    <label className="block">

                        <span className="mb-2 block font-bold">
                            Patient
                        </span>

                        <select
                            className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4"
                            value={form.patientId}
                            onChange={handlePatientChange}
                        >

                            <option value="">
                                Select patient
                            </option>

                            {patients.map((patient) => (

                                <option
                                    key={patient.id}
                                    value={patient.id}
                                >
                                    {patient.name}
                                </option>

                            ))}

                        </select>

                    </label>


                    {/* Assigned Doctor */}

                    <label className="block">

                        <span className="mb-2 block font-bold">
                            Assigned doctor
                        </span>

                        <select
                            className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4"
                            value={form.doctorId}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    doctorId: event.target.value
                                }))
                            }
                        >

                            <option value="">
                                Select doctor
                            </option>

                            {doctors.map((doctor) => (

                                <option
                                    key={doctor.id}
                                    value={doctor.id}
                                >
                                    {doctor.name}
                                    {' — '}
                                    {doctor.specialization}
                                </option>

                            ))}

                        </select>

                    </label>


                    {/* Selected Assignment Information */}

                    {selectedPatient && selectedPatient.assignedDoctor && (

                        <div className="rounded-lg bg-teal-50 p-3">

                            <p className="text-sm font-bold text-teal-700">
                                Assigned doctor for this patient
                            </p>

                            <p className="mt-1 font-extrabold">
                                {selectedPatient.assignedDoctor.name}
                            </p>

                        </div>

                    )}


                    {/* Medicine + Dosage */}

                    <div className="grid gap-4 sm:grid-cols-2">

                        <Input
                            label="Medicine"
                            value={form.medicine}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    medicine:
                                        event.target.value
                                }))
                            }
                            placeholder="Medicine name"
                        />

                        <Input
                            label="Dosage"
                            value={form.dosage}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    dosage:
                                        event.target.value
                                }))
                            }
                            placeholder="500 mg"
                        />

                    </div>


                    {/* Frequency + Duration */}

                    <div className="grid gap-4 sm:grid-cols-2">

                        <label className="block">

                            <span className="mb-2 block font-bold">
                                Frequency
                            </span>

                            <select
                                className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4"
                                value={form.frequency}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        frequency:
                                            event.target.value
                                    }))
                                }
                            >

                                <option>
                                    Once daily
                                </option>

                                <option>
                                    Twice daily
                                </option>

                                <option>
                                    Three times daily
                                </option>

                            </select>

                        </label>


                        <Input
                            label="Duration"
                            value={form.duration}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    duration:
                                        event.target.value
                                }))
                            }
                            placeholder="7 days"
                        />

                    </div>


                    {/* Notes */}

                    <Input
                        label="Notes"
                        value={form.notes}
                        onChange={(event) =>
                            setForm((current) => ({
                                ...current,
                                notes:
                                    event.target.value
                            }))
                        }
                        placeholder="Instructions for the patient"
                    />


                    <Button
                        type="submit"
                        className="w-full"
                    >
                        Create prescription
                    </Button>

                </form>

            </Modal>


            {/* Prescription Details Modal */}

            <Modal
                open={Boolean(selected)}
                title="Prescription details"
                onClose={() => setSelected(null)}
            >

                {selected && (

                    <div className="printable-prescription">

                        <div className="rounded-xl bg-teal-50 p-4">

                            <p className="text-xl font-extrabold">
                                SEBASETHU
                            </p>

                            <p className="mt-1 text-sm font-bold text-teal-700">

                                Prescription for{' '}

                                {selected.patient?.name ||
                                    selected.patient}

                            </p>

                        </div>


                        <p className="mt-5 font-bold">

                            Doctor:{' '}

                            {selected.doctor?.name ||
                                selected.doctor}

                        </p>


                        {selected.medicines?.map(
                            (medicine) => (

                                <div
                                    key={
                                        medicine.id ||
                                        medicine.name
                                    }
                                    className="mt-4 rounded-xl border border-navy-100 p-4"
                                >

                                    <p className="font-extrabold">

                                        {medicine.name}
                                        {' · '}
                                        {medicine.dosage}

                                    </p>

                                    <p className="mt-1 text-navy-700">

                                        {medicine.frequency}
                                        {' for '}
                                        {medicine.duration}

                                    </p>

                                </div>

                            )
                        )}


                        {selected.notes && (

                            <p className="mt-4 text-navy-700">
                                {selected.notes}
                            </p>

                        )}


                        <Button
                            className="mt-5 w-full"
                            onClick={() =>
                                window.print()
                            }
                        >
                            <Printer size={18} />
                            Print prescription
                        </Button>

                    </div>

                )}

            </Modal>

        </div>
    );
}