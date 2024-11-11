import { fetchPendingOvertimes } from '@/app/actions';
import { Empty } from 'antd';
import { OvertimeRequestCard } from '.';

export async function OvertimeRequestList() {
  const data = await fetchPendingOvertimes();

  if (data.length === 0) {
    return (
      <div className='py-5 my-5'>
        <Empty
          description={<p>요청된 초과근무 지시자 승인이 없습니다</p>}
        />
      </div>
    );
  }
  return data.map(({ id }) => (
    <OvertimeRequestCard
      key={id}
      overtimeId={id}
    />
  ));
}
