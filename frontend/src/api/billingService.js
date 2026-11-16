import api from './axios';
import { isDemoMode } from './demoAuth';
import { demoCreateInvoice, demoListStaffInvoices, demoMarkInvoicePaid } from '../mock/demoStore';

export const billingService = {
  listStaffInvoices: () =>
    isDemoMode()
      ? Promise.resolve(demoListStaffInvoices())
      : api.get('/reception/invoices').then(({ data }) => data),

  createInvoice: (invoice) =>
    isDemoMode()
      ? Promise.resolve(demoCreateInvoice(invoice))
      : api.post('/reception/invoices', invoice).then(({ data }) => data),

  markPaid: (id, paymentMethod) =>
    isDemoMode()
      ? Promise.resolve(demoMarkInvoicePaid(id, paymentMethod))
      : api.patch(`/reception/invoices/${id}/payment`, { paymentMethod }).then(({ data }) => data),
};
