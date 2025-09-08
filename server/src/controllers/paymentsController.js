const Payment = require('@src/models/Payment');

function parsePositiveInt(value, defaultValue, maxValue) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n <= 0) return defaultValue;
  if (maxValue) return Math.min(n, maxValue);
  return n;
}

function buildDateFilter(from, to) {
  const filter = {};
  if (!from && !to) return filter;

  const createdAt = {};
  if (from) {
    const fromDate = new Date(from);
    if (isNaN(fromDate.getTime())) throw new Error('Invalid \'from\' date');
    createdAt.$gte = fromDate;
  }
  if (to) {
    const toDate = new Date(to);
    if (isNaN(toDate.getTime())) throw new Error('Invalid \'to\' date');
    createdAt.$lte = toDate;
  }
  if (createdAt.$gte && createdAt.$lte && createdAt.$gte > createdAt.$lte) {
    throw new Error("'from' must be before 'to'");
  }
  filter.createdAt = createdAt;
  return filter;
}

exports.listPayments = async (req, res) => {
  try {
    const page = parsePositiveInt(req.query.page, 1);
    const pageSize = parsePositiveInt(req.query.pageSize, 20, 100);

    const { from, to } = req.query;
    const status = req.query.status;

    const filter = {};

    // Date range
    try {
      Object.assign(filter, buildDateFilter(from, to));
    } catch (e) {
      return res.status(400).json({ ok: false, error: e.message });
    }

    // Status filter
    if (status) {
      const allowed = ['paid', 'failed'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ ok: false, error: "Invalid status. Allowed: 'paid' | 'failed'" });
      }
      filter.status = status;
    }

    const total = await Payment.countDocuments(filter);

    const items = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const agg = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          amountCents: { $sum: '$amountCents' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totals = {
      amountCents: agg[0]?.amountCents || 0,
      count: agg[0]?.count || 0
    };

    return res.status(200).json({ ok: true, items, total, page, pageSize, totals });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};
