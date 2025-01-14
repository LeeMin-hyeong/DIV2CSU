import { Collapse, ConfigProvider, Empty } from 'antd';
import { OvertimeCard } from './OvertimeCard';
import { useMemo } from 'react';

export type OvertimeHistoryListProps = { type: 'enlisted'|'nco'; data: { id: string, verified_at: Date | null, approved_at: Date | null }[] };

export function OvertimeHistoryList({
  data,
  type,
}: OvertimeHistoryListProps) {
  if (!data || data.length === 0) {
    return (
      <div className='py-5 my-5'>
        <Empty
          description={
            <p>
              {type === 'enlisted'
                ? '초과근무가 없습니다'
                : '승인한 초과근무가 없습니다'}
            </p>
          }
        />
      </div>
    );
  }
  const unverified = data.filter((data) => data.verified_at === null)
  const verified   = data.filter((data) => data.verified_at !== null)
  const unapproved = data.filter((data) => data.verified_at !== null && data.approved_at === null)

  const items = useMemo(() => {
    if (!data) return [];
    const newItems = [];
  
    if (type === 'enlisted') {
      newItems.push({
        key: 'unapproved',
        label: `초과근무 확인관 승인 대기 내역 (${unapproved.length})`,
        children: unapproved.map((d) => <OvertimeCard key={d.id} overtimeId={d.id}/>),
      });
      newItems.push({
        key: 'unverified',
        label: `초과근무 지시자 승인 대기 내역 (${unverified.length})`,
        children: unverified.map((d) => <OvertimeCard key={d.id} overtimeId={d.id}/>),
      });
    }
  
    newItems.push({
      key: 'verified',
      label: `초과근무 ${type === 'nco' ? '승인' : ''} 내역 (${verified.length})`,
      children: verified.map((d) => <OvertimeCard key={d.id} overtimeId={d.id}/>),
    });
  
    return newItems;
  }, [data, type, unverified, verified, unapproved]);

  return (
    <div>
      {data && <ConfigProvider
        theme={{
          components: {
            Collapse: {
              headerBg: '#ffffff',
              contentPadding: '0px 0px',
              contentBg: 'rgba(0, 0, 0, 0)'
            },
          },
        }}
        >
        <Collapse items={items} defaultActiveKey={type === 'enlisted' ? ['unapproved', 'unverified'] : ['verified']}/>
      </ConfigProvider>}
    </div>
  );
}
