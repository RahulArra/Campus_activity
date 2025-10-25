const dayjs = require('dayjs');

function buildDateRange(from, to) {
  if (!from && !to) return null;
  const range = {};
  if (from) range.$gte = dayjs(from).startOf('day').toDate();
  if (to) range.$lte = dayjs(to).endOf('day').toDate();
  return range;
}

module.exports = { buildDateRange };
