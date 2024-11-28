import { Empty } from 'antd';
import { OvertimeCard } from './OvertimeCard';

export type OvertimeHistoryListProps = { type: string; data: { id: string }[] };

export async function OvertimeHistoryList({
  data,
  type,
}: OvertimeHistoryListProps) {
  if (data.length === 0) {
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
  return data.map(({ id }) => (
    <OvertimeCard
      key={id}
      overtimeId={id}
    />
  ));
}
