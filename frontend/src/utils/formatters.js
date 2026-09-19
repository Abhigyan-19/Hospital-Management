export const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value);
export const initials = (name = '') => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
