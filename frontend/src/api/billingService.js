import api from './axios';
import { isDemoMode } from './demoAuth';
import { demoCreateInvoice, demoListStaffInvoices, demoMarkInvoicePaid } from '../mock/demoStore';

export const billingService = {
  listStaffInvoices: () =>
    isDemoMode()
      ? Promise.resolve(demoListStaffInvoices())
      : api.get('/reception/invoices')
          .then(({ data }) => data)
          .catch(() =>
            api.get('/bills').then(({ data }) =>
              (data || []).map((b) => ({
                id: b.id,
                invoiceNumber: b.invoiceNumber,
                patientId: b.patient?.id || b.patientId,
                patientName: b.patient?.name,
                description: b.description,
                amount: b.amount,
                status: b.status,
                createdAt: b.createdAt,
              })),
            ),
          ),

  createInvoice: (invoice) =>
    isDemoMode()
      ? Promise.resolve(demoCreateInvoice(invoice))
      : api.post('/reception/invoices', invoice)
          .then(({ data }) => data)
          .catch(() =>
            api.post('/bills', {
              patientId: Number(invoice.patientId),
              amount: Number(invoice.amount),
              description: invoice.description,
              status: 'PENDING',
            }).then(({ data: b }) => ({
              id: b.id,
              invoiceNumber: b.invoiceNumber,
              patientId: b.patient?.id || b.patientId,
              patientName: b.patient?.name,
              description: b.description,
              amount: b.amount,
              status: b.status,
              createdAt: b.createdAt,
            })),
          ),

  markPaid: (id, paymentMethod) =>
    isDemoMode()
      ? Promise.resolve(demoMarkInvoicePaid(id, paymentMethod))
      : api.patch(`/reception/invoices/${id}/payment`, { paymentMethod })
          .then(({ data }) => data)
          .catch(() =>
            api.patch(`/bills/${id}/status`, { status: 'PAID' }).then(({ data: b }) => ({
              id: b.id,
              invoiceNumber: b.invoiceNumber,
              patientId: b.patient?.id || b.patientId,
              patientName: b.patient?.name,
              description: b.description,
              amount: b.amount,
              status: b.status,
              paymentMethod,
              createdAt: b.createdAt,
            })),
          ),

  downloadPdf: (id, invoiceNumber) =>
    api.get(`/bills/${id}/pdf`, { responseType: 'blob' }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoiceNumber || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }),
};
