import { Empty } from 'antd';
import { PointCard } from './PointCard';

export type PointsHistoryListProps = { type: string; data: { id: string }[] };

export async function PointsHistoryList({
  data,
  type,
}: PointsHistoryListProps) {
  if (data.length === 0) {
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
  return data.map(({ id }) => (
    <PointCard
      key={id}
      pointId={id}
    />
  ));
}
