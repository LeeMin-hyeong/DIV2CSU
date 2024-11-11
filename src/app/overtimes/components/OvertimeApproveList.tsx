import { fetchApproveOvertimes } from '@/app/actions';
import { Empty } from 'antd';
import { OvertimeApproveCard } from '.';

export async function OvertimeApproveList() {
  const data = await fetchApproveOvertimes();

  if (data.length === 0) {
    return (
      <div className='py-5 my-5'>
        <Empty
          description={<p>요청된 초과근무 확인관 승인이 없습니다</p>}
        />
      </div>
    );
  }
  return data.map(({ id }) => (
    <OvertimeApproveCard
      key={id}
      overtimeId={id}
    />
  ));
}
