import { Collapse, ConfigProvider, Empty } from 'antd';
import { PointRequestCard } from '.';
import { useMemo } from 'react';
import { fetchPendingPoints } from '@/app/actions';

type PointRequestListProps = {
  data: Awaited<ReturnType<typeof fetchPendingPoints>>;
};

export function PointRequestList({ data }: PointRequestListProps) {
  const items = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [
      {
        key: 'requested',
        label: `상벌점 승인 요청 내역 (${data.length})`,
        children: data.map((d) => <PointRequestCard key={d.id} pointId={d.id} />),
      },
    ];
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="py-5 my-5">
        <Empty description={<p>상벌점 승인 요청이 없습니다</p>} />
      </div>
    );
  }

  return (
    <div>
      <ConfigProvider
        theme={{
          components: {
            Collapse: {
              headerBg: '#ffffff',
              contentPadding: '0px 0px',
              contentBg: 'rgba(0, 0, 0, 0)',
            },
          },
        }}
      >
        <Collapse items={items} defaultActiveKey={['requested']} />
      </ConfigProvider>
    </div>
  );
}
