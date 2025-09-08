const Subscriber = require('@src/models/Subscriber');

function parsePositiveInt(value, defaultValue, maxValue) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n <= 0) return defaultValue;
  if (maxValue) return Math.min(n, maxValue);
  return n;
}

exports.listSubscribers = async (req, res) => {
  try {
    const page = parsePositiveInt(req.query.page, 1);
    const pageSize = parsePositiveInt(req.query.pageSize, 20, 100);

    const { q, status } = req.query;

    const filter = {};

    if (status) {
      const allowed = ['active', 'inactive'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ ok: false, error: "Invalid status. Allowed: 'active' | 'inactive'" });
      }
      filter.status = status;
    }

    if (q && String(q).trim().length > 0) {
      const needle = String(q).trim().toLowerCase();
      filter.$or = [
        { $expr: { $gt: [{ $indexOfCP: [{ $toLower: '$username' }, needle] }, -1] } },
        { $expr: { $gt: [{ $indexOfCP: [{ $toLower: '$firstName' }, needle] }, -1] } },
        { $expr: { $gt: [{ $indexOfCP: [{ $toLower: '$lastName' }, needle] }, -1] } }
      ];
    }

    const total = await Subscriber.countDocuments(filter);

    const items = await Subscriber.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return res.status(200).json({ ok: true, items, total, page, pageSize });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};
