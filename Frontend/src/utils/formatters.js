export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Completed':
    case 'Active':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Confirmed':
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Pending':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Cancelled':
    case 'Inactive':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
