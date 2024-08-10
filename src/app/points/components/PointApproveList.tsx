import { fetchApprovePoints } from '@/app/actions';
import { Empty } from 'antd';
import { PointApproveCard } from '.';

export async function PointApproveList() {
  const data = await fetchApprovePoints();

  if (data.length === 0) {
    return (
      <div className='py-5 my-5'>
        <Empty
          description={<p>요청된 최종 승인이 없습니다</p>}
        />
      </div>
    );
  }
  return data.map(({ id }) => (
    <PointApproveCard
      key={id}
      pointId={id}
    />
  ));
}
