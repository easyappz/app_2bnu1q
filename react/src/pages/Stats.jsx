import React, { useMemo, useState } from 'react';
import { Card, DatePicker, Row, Col, Skeleton, Typography, Space, Select } from 'antd';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { timeseries, summary } from '../api/stats';
import { formatCurrency } from '../utils/format';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const { RangePicker } = DatePicker;

const Stats = () => {
  const [range, setRange] = useState([dayjs().subtract(6, 'day'), dayjs()]);
  const [summaryRange, setSummaryRange] = useState('week');

  const fromISO = useMemo(() => range?.[0]?.startOf('day').toISOString(), [range]);
  const toISO = useMemo(() => range?.[1]?.endOf('day').toISOString(), [range]);

  const tsQuery = useQuery({
    queryKey: ['stats-timeseries', fromISO, toISO],
    queryFn: () => timeseries({ from: fromISO, to: toISO, interval: 'day' }),
    enabled: Boolean(fromISO && toISO),
  });

  const sumQuery = useQuery({ queryKey: ['stats-summary', summaryRange], queryFn: () => summary(summaryRange) });

  const data = (tsQuery.data?.items || []).map((it) => ({
    date: it.date,
    amount: (it.amountCents || 0) / 100,
    count: it.count || 0,
  }));

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>Динамика платежей</Typography.Title>
          <Space wrap>
            <RangePicker value={range} onChange={(v) => setRange(v)} allowClear={false} />
            <Select
              value={summaryRange}
              onChange={setSummaryRange}
              options={[
                { value: 'day', label: 'День' },
                { value: 'week', label: 'Неделя' },
                { value: 'month', label: 'Месяц' },
              ]}
            />
          </Space>
          {tsQuery.isLoading ? (
            <Skeleton active />
          ) : (
            <div style={{ width: '100%', height: 360 }}>
              <ResponsiveContainer>
                <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1677ff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#1677ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#52c41a" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => (name === 'Сумма' ? formatCurrency(value * 100, 'USD') : value)} />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="amount" name="Сумма" stroke="#1677ff" fillOpacity={1} fill="url(#colorAmount)" />
                  <Area yAxisId="right" type="monotone" dataKey="count" name="Кол-во" stroke="#52c41a" fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" title="Итого за период">
                <div style={{ fontSize: 18, fontWeight: 600 }}>{formatCurrency(tsQuery.data?.totals?.amountCents || 0, 'USD')}</div>
                <div style={{ color: '#888' }}>Платежей: {tsQuery.data?.totals?.count || 0}</div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" title="Сводка">
                {sumQuery.isLoading ? (
                  <Skeleton active />
                ) : (
                  <>
                    <div>Период: {sumQuery.data?.range}</div>
                    <div>Сумма: {formatCurrency(sumQuery.data?.amountCents || 0, 'USD')}</div>
                    <div>Платежей: {sumQuery.data?.count || 0}</div>
                  </>
                )}
              </Card>
            </Col>
          </Row>
        </Space>
      </Card>
    </Space>
  );
};

export default Stats;
