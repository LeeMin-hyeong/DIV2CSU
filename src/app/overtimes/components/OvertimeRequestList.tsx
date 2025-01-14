import { Collapse, ConfigProvider, Empty } from 'antd';
import { OvertimeRequestCard } from '.';
import { useMemo } from 'react';
import { fetchApproveOvertimes, fetchPendingOvertimes } from '@/app/actions';

type OvertimeRequestListProps = {
  type: 'verify' | 'approve';
  data: Awaited<ReturnType<typeof fetchPendingOvertimes | typeof fetchApproveOvertimes>>;
};

export function OvertimeRequestList({ type, data }: OvertimeRequestListProps) {
  if (data.length === 0) {
    return (
      <div className='py-5 my-5'>
        <Empty
          description={
            <p>
              초과근무 {type === 'verify' ? '지시자' : '확인관'} 승인 요청이 없습니다
            </p>
          }
        />
      </div>
    );
  }

  const items = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: 'requested',
        label: `초과근무 ${type === 'verify' ? '지시자' : '확인관'} 승인 요청 내역 (${data.length})`,
        children: data.map((d) => (
          <OvertimeRequestCard key={d.id} overtimeId={d.id} type={type} />
        )),
      },
    ];
  }, [data, type]);

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
