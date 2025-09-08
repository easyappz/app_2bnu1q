import React, { useMemo, useState } from 'react';
import { Card, Table, Input, Select, Space, Skeleton, message } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { listSubscribers } from '../api/subscribers';
import { formatDateTime } from '../utils/format';

const Subscribers = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState();

  const params = useMemo(() => ({ page, pageSize, q: q || undefined, status: status || undefined }), [page, pageSize, q, status]);

  const { data, isLoading, isError, error } = useQuery({ queryKey: ['subscribers', params], queryFn: () => listSubscribers(params) });

  if (isError) {
    message.error(error?.response?.data?.error || 'Ошибка загрузки подписчиков');
  }

  const columns = [
    { title: 'Имя пользователя', dataIndex: 'username', key: 'username' },
    { title: 'Имя', dataIndex: 'firstName', key: 'firstName' },
    { title: 'Фамилия', dataIndex: 'lastName', key: 'lastName' },
    { title: 'Статус', dataIndex: 'status', key: 'status' },
    { title: 'Дата', dataIndex: 'createdAt', key: 'createdAt', render: (v) => formatDateTime(v) },
  ];

  const items = data?.items || [];
  const total = data?.total || 0;

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Space wrap style={{ marginBottom: 12 }}>
          <Input placeholder="Поиск (имя, фамилия, username)" value={q} onChange={(e) => setQ(e.target.value)} allowClear style={{ width: 280 }} />
          <Select
            placeholder="Статус"
            allowClear
            style={{ width: 160 }}
            value={status}
            onChange={setStatus}
            options={[{ value: 'active', label: 'Активен' }, { value: 'inactive', label: 'Неактивен' }]}
          />
        </Space>
        {isLoading ? (
          <Skeleton active />
        ) : (
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
        )}
      </Card>
    </Space>
  );
};

export default Subscribers;
