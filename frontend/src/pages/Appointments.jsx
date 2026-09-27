import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { appointmentService } from '../api/appointmentService';
import api from '../api/axios';

import {
  Button,
  Card,
  EmptyState,
  Modal,
  SearchBox,
  Badge
} from '../components/ui';

const today = new Date().toISOString().split('T')[0];

const emptyForm = {
  patientId: '',
  doctorId: '',
  date: today,
  time: '09:30'
};

const slots = ['09:30', '11:00', '14:15', '16:00'];

export default function Appointments() {

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [view, setView] = useState('list');

  // Load appointments, patients and doctors
  useEffect(() => {

    appointmentService.list()
      .then(setAppointments)
      .catch(() => toast.error('Failed to load appointments.'));

    api.get('/patients')
      .then(({ data }) => setPatients(data))
      .catch(() => toast.error('Failed to load patients.'));

    api.get('/doctors')
      .then(({ data }) => setDoctors(data))
      .catch(() => toast.error('Failed to load doctors.'));

  }, []);

  // Search appointments
  const visible = useMemo(() => {

    return appointments.filter((appointment) => {

      const patientName =
        appointment.patient?.name || '';

      const doctorName =
        appointment.doctor?.name || '';

      const specialization =
        appointment.doctor?.specialization || '';

      const text =
        `${patientName} ${doctorName} ${specialization}`
          .toLowerCase();

      return text.includes(search.toLowerCase());
    });

  }, [appointments, search]);

  // Check whether selected doctor's slot is already booked
  const booked = useMemo(() => {

    if (!form.doctorId || !form.date || !form.time) {
      return false;
    }

    return appointments.some((appointment) =>
      appointment.doctor?.id === Number(form.doctorId) &&
      appointment.date === form.date &&
      appointment.time === form.time &&
      appointment.status !== 'Cancelled'
    );

  }, [appointments, form.doctorId, form.date, form.time]);

  // Create appointment
  const submit = async (event) => {

    event.preventDefault();

    if (!form.patientId) {
      return toast.error('Please select a patient.');
    }

    if (!form.doctorId) {
      return toast.error('Please select a doctor.');
    }

    if (!form.date) {
      return toast.error('Please select a date.');
    }

    if (!form.time) {
      return toast.error('Please select a time slot.');
    }

    if (booked) {
      return toast.error(
        'That doctor is already booked for this time slot.'
      );
    }

    try {

      const created = await appointmentService.create({
        patientId: Number(form.patientId),
        doctorId: Number(form.doctorId),
        date: form.date,
        time: form.time
      });

      setAppointments((current) => [
        ...current,
        created
      ]);

      setForm(emptyForm);
      setFormOpen(false);

      toast.success('Appointment scheduled.');

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        'Failed to schedule appointment.'
      );
    }
  };

  // Update appointment status
  const changeStatus = async (appointment, status) => {

    try {

      const updated =
        await appointmentService.updateStatus(
          appointment.id,
          status
        );

      setAppointments((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item
        )
      );

      toast.success(
        `Appointment marked ${status.toLowerCase()}.`
      );

    } catch (error) {

      console.error(error);

      toast.error(
        'Failed to update appointment status.'
      );
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">

      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <div>

          <p className="font-bold text-teal-700">
            Care coordination
          </p>

          <h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">
            Appointments
          </h2>

          <p className="mt-2 text-navy-700">
            Book, review and update upcoming patient visits.
          </p>

        </div>

        <Button onClick={() => setFormOpen(true)}>
          <Plus size={19} />
          Book appointment
        </Button>

      </div>


      {/* Main Card */}

      <Card>

        {/* View controls */}

        <div className="flex flex-col gap-4 border-b border-navy-100 pb-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex gap-2">

            <Button
              variant={view === 'list' ? 'primary' : 'secondary'}
              className="px-4"
              onClick={() => setView('list')}
            >
              List view
            </Button>

            <Button
              variant={view === 'calendar' ? 'primary' : 'secondary'}
              className="px-4"
              onClick={() => setView('calendar')}
            >
              <CalendarDays size={17} />
              Week view
            </Button>

          </div>

          <div className="w-full lg:max-w-sm">

            <SearchBox
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search appointments"
            />

          </div>

        </div>


        {/* Calendar view */}

        {view === 'calendar' ? (

          <div className="grid gap-3 py-6 sm:grid-cols-3">

            {[0, 1, 2].map((offset) => {

              const dateObject = new Date();

              dateObject.setDate(
                dateObject.getDate() + offset
              );

              const date =
                dateObject.toISOString().split('T')[0];

              const dayAppointments =
                visible.filter(
                  (appointment) =>
                    appointment.date === date
                );

              return (

                <div
                  key={date}
                  className="rounded-xl border border-navy-100 p-4"
                >

                  <p className="font-extrabold">
                    {offset === 0 ? 'Today' : date}
                  </p>

                  <div className="mt-4 space-y-3">

                    {dayAppointments.map((appointment) => (

                      <div
                        key={appointment.id}
                        className="rounded-lg bg-teal-50 p-3"
                      >

                        <p className="font-extrabold text-teal-700">
                          {appointment.time}
                        </p>

                        <p className="mt-1 text-sm font-bold">
                          {appointment.patient?.name}
                        </p>

                        <p className="text-sm text-navy-700">
                          {appointment.doctor?.name}
                        </p>

                      </div>

                    ))}

                    {dayAppointments.length === 0 && (

                      <p className="text-sm text-navy-500">
                        No appointments
                      </p>

                    )}

                  </div>

                </div>

              );

            })}

          </div>

        ) : (

          /* List view */

          visible.length === 0 ? (

            <div className="py-8">

              <EmptyState title="No appointments found">
                Book a visit or change your search.
              </EmptyState>

            </div>

          ) : (

            <div className="mt-5 space-y-3">

              {visible.map((appointment) => (

                <div
                  key={appointment.id}
                  className="flex flex-col gap-4 rounded-xl border border-navy-100 p-4 lg:flex-row lg:items-center lg:justify-between"
                >

                  <div className="flex items-start gap-4">

                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-teal-50 font-extrabold text-teal-700">

                      {appointment.time}

                    </span>

                    <div>

                      <p className="font-extrabold">

                        {appointment.patient?.name}

                      </p>

                      <p className="mt-1 text-sm text-navy-700">

                        {appointment.doctor?.name}
                        {' · '}
                        {appointment.doctor?.specialization}

                      </p>

                      <p className="mt-1 text-sm font-bold text-navy-500">

                        {appointment.date}

                      </p>

                    </div>

                  </div>


                  <div className="flex flex-wrap items-center gap-2">

                    <Badge
                      tone={
                        appointment.status === 'Completed'
                          ? 'success'
                          : appointment.status === 'Cancelled'
                            ? 'danger'
                            : 'info'
                      }
                    >
                      {appointment.status}
                    </Badge>


                    {appointment.status === 'Scheduled' && (

                      <>

                        <Button
                          variant="secondary"
                          className="px-3"
                          onClick={() =>
                            changeStatus(
                              appointment,
                              'Completed'
                            )
                          }
                        >
                          <Check size={17} />
                          Complete
                        </Button>

                        <Button
                          variant="ghost"
                          className="px-3 text-danger"
                          onClick={() =>
                            changeStatus(
                              appointment,
                              'Cancelled'
                            )
                          }
                        >
                          <X size={17} />
                          Cancel
                        </Button>

                      </>

                    )}

                  </div>

                </div>

              ))}

            </div>

          )

        )}

      </Card>


      {/* Book appointment modal */}

      <Modal
        open={formOpen}
        title="Book appointment"
        onClose={() => setFormOpen(false)}
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
              onChange={(event) =>
                setForm({
                  ...form,
                  patientId: event.target.value
                })
              }
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


          {/* Doctor */}

          <label className="block">

            <span className="mb-2 block font-bold">
              Doctor
            </span>

            <select
              className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4"
              value={form.doctorId}
              onChange={(event) =>
                setForm({
                  ...form,
                  doctorId: event.target.value
                })
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
                  {doctor.name} — {doctor.specialization}
                </option>

              ))}

            </select>

          </label>


          {/* Date and time */}

          <div className="grid gap-4 sm:grid-cols-2">

            <label className="block">

              <span className="mb-2 block font-bold">
                Date
              </span>

              <input
                type="date"
                className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4"
                value={form.date}
                onChange={(event) =>
                  setForm({
                    ...form,
                    date: event.target.value
                  })
                }
              />

            </label>


            <label className="block">

              <span className="mb-2 block font-bold">
                Time slot
              </span>

              <select
                className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4"
                value={form.time}
                onChange={(event) =>
                  setForm({
                    ...form,
                    time: event.target.value
                  })
                }
              >

                {slots.map((slot) => {

                  const slotBooked =
                    form.doctorId &&
                    appointments.some(
                      (appointment) =>
                        appointment.doctor?.id ===
                          Number(form.doctorId) &&
                        appointment.date === form.date &&
                        appointment.time === slot &&
                        appointment.status !== 'Cancelled'
                    );

                  return (

                    <option
                      key={slot}
                      value={slot}
                    >
                      {slot}
                      {slotBooked ? ' - Booked' : ''}
                    </option>

                  );

                })}

              </select>

            </label>

          </div>


          {booked && (

            <p className="text-sm font-bold text-danger">
              This doctor is already booked for this
              time slot. Please select another time.
            </p>

          )}


          <Button
            type="submit"
            className="w-full"
            disabled={booked}
          >
            Confirm appointment
          </Button>

        </form>

      </Modal>

    </div>
  );
}