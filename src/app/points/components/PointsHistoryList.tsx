import { Collapse, ConfigProvider, Empty } from 'antd';
import { PointCard } from './PointCard';
import { useMemo } from 'react';

export type PointsHistoryListProps = { 
  type: 'enlisted' | 'nco'; 
  data: { id: string; verified_at: Date | null; rejected_at: Date | null; }[]; 
};

export function PointsHistoryList({ data, type }: PointsHistoryListProps) {
  const unverified = data?.filter((d) => d.verified_at === null) || [];
  const verified = data?.filter((d) => d.verified_at !== null) || [];
  const rejected = data?.filter((d) => d.rejected_at !== null) || [];

  const items = useMemo(() => {
    const enlistedItems = [];

    if (type === 'enlisted') {
      enlistedItems.push({
        key: 'unverified',
        label: `상벌점 요청 내역 (${unverified.length})`,
        children: unverified.map((d) => <PointCard key={d.id} pointId={d.id} />),
      });
    }

    enlistedItems.push(
      {
        key: 'rejected',
        label: `상벌점 반려 내역 (${rejected.length})`,
        children: rejected.map((d) => <PointCard key={d.id} pointId={d.id} />),
      },
      {
        key: 'verified',
        label: `상벌점 ${type === 'nco' ? '승인' : ''} 내역 (${verified.length})`,
        children: verified.map((d) => <PointCard key={d.id} pointId={d.id} />),
      },
    );

    return enlistedItems;
  }, [type, unverified, verified, rejected]);

  if (!data || data.length === 0) {
    return (
      <div className='py-5 my-5'>
        <Empty
          description={
            <p>
              {type === 'enlisted'
                ? '받은 상벌점이 없습니다'
                : '부여한 상벌점이 없습니다'}
            </p>
          }
        />
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
        <Collapse
          items={items}
          defaultActiveKey={type === 'enlisted' ? ['unverified', 'rejected'] : ['verified']}
        />
      </ConfigProvider>
    </div>
  );
}
