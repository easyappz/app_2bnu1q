const Payment = require('@src/models/Payment');
const { startOfUTCDay, addDays, toISODate, clampDateRange, generateDayKeys, getRangeStart } = require('@src/utils/time');

exports.getSummary = async (req, res) => {
  try {
    const { range } = req.query;
    const allowed = ['day', 'week', 'month'];
    if (!allowed.includes(range)) {
      return res.status(400).json({ ok: false, error: "Invalid 'range'. Allowed: day | week | month" });
    }

    const now = new Date();
    const from = getRangeStart(range, now);
    const to = now;

    const match = {
      status: 'paid',
      createdAt: { $gte: from, $lte: to }
    };

    const agg = await Payment.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          amountCents: { $sum: '$amountCents' },
          count: { $sum: 1 }
        }
      }
    ]);

    const amountCents = agg[0]?.amountCents || 0;
    const count = agg[0]?.count || 0;

    return res.status(200).json({
      ok: true,
      range,
      from: from.toISOString(),
      to: to.toISOString(),
      amountCents,
      count
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};

exports.getTimeseries = async (req, res) => {
  try {
    const { from: fromStr, to: toStr, interval } = req.query;

    if (!fromStr || !toStr) {
      return res.status(400).json({ ok: false, error: "'from' and 'to' are required in ISO format" });
    }

    if (interval && interval !== 'day') {
      return res.status(400).json({ ok: false, error: "Only 'day' interval is supported" });
    }

    const parsed = clampDateRange(fromStr, toStr);
    if (parsed.error) {
      return res.status(400).json({ ok: false, error: parsed.error });
    }

    const from = parsed.from;
    const to = parsed.to;

    const match = {
      status: 'paid',
      createdAt: { $gte: from, $lte: to }
    };

    const agg = await Payment.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          amountCents: { $sum: '$amountCents' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const map = new Map();
    for (const row of agg) {
      map.set(row._id, { date: row._id, amountCents: row.amountCents, count: row.count });
    }

    const keys = generateDayKeys(from, to);
    const items = keys.map((k) => map.get(k) || { date: k, amountCents: 0, count: 0 });

    const totals = items.reduce(
      (acc, it) => {
        acc.amountCents += it.amountCents;
        acc.count += it.count;
        return acc;
      },
      { amountCents: 0, count: 0 }
    );

    return res.status(200).json({
      ok: true,
      from: from.toISOString(),
      to: to.toISOString(),
      interval: 'day',
      items,
      totals
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};
