import React, { useMemo, useState } from 'react';
import { Card, Table, DatePicker, Select, Space, Typography, Skeleton, message } from 'antd';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { listPayments } from '../api/payments';
import { formatCurrency, formatDateTime } from '../utils/format';

const { RangePicker } = DatePicker;

const Payments = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState();
  const [range, setRange] = useState();

  const params = useMemo(() => ({
    page,
    pageSize,
    status: status || undefined,
    from: range?.[0] ? dayjs(range[0]).startOf('day').toISOString() : undefined,
    to: range?.[1] ? dayjs(range[1]).endOf('day').toISOString() : undefined,
  }), [page, pageSize, status, range]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['payments', params],
    queryFn: () => listPayments(params),
  });

  if (isError) {
    message.error(error?.response?.data?.error || 'Ошибка загрузки платежей');
  }

  const columns = [
    { title: 'Дата', dataIndex: 'createdAt', key: 'createdAt', render: (v) => formatDateTime(v) },
    { title: 'Сумма', dataIndex: 'amountCents', key: 'amountCents', render: (v, r) => formatCurrency(v || 0, r.currency || 'USD') },
    { title: 'Статус', dataIndex: 'status', key: 'status', filters: [ { text: 'Оплачен', value: 'paid' }, { text: 'Ошибка', value: 'failed' } ],
      onFilter: (_value, _record) => true },
  ];

  const items = data?.items || [];
  const total = data?.total || 0;

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Space wrap style={{ marginBottom: 12 }}>
          <RangePicker value={range} onChange={setRange} />
          <Select
            placeholder="Статус"
            allowClear
            style={{ width: 160 }}
            value={status}
            onChange={setStatus}
            options={[{ value: 'paid', label: 'Оплачен' }, { value: 'failed', label: 'Ошибка' }]}
          />
        </Space>
        {isLoading ? (
          <Skeleton active />
        ) : (
          <>
            <Typography.Paragraph>
              Итого по фильтру: сумма {formatCurrency(data?.totals?.amountCents || 0, 'USD')}, платежей {data?.totals?.count || 0}
            </Typography.Paragraph>
            <Table
              rowKey={(r) => r._id || r.id}
              columns={columns}
              dataSource={items}
              pagination={{
                current: page,
                pageSize,
                total,
                showSizeChanger: true,
                onChange: (p, ps) => {
                  setPage(p);
                  setPageSize(ps);
                },
              }}
            />
          </>
        )}
      </Card>
    </Space>
  );
};

export default Payments;
