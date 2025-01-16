import { fetchOvertimeSummary, fetchPointSummary } from '@/app/actions';
import { Card, Row } from 'antd';
import Link from 'next/link';
import { useLayoutEffect, useState } from 'react';

export type UserCardProps = {
  sn: string;
  name: string;
  type: string;
  deleted_at: Date | null;
  rejected_at: Date | null;
};

export function UserCard({ type, sn, name, deleted_at, rejected_at }: UserCardProps) {
  if (deleted_at && rejected_at) {
    return null; // deleted_at, rejected_at 값이 존재할 경우 카드를 null로 반환하여 숨김
  }
  const [pointData, setPointData] = useState<number | null>(null)
  const [overtimeData, setOvertimeData] = useState<number | null>(null)

  useLayoutEffect(() => {
    fetchPointSummary(sn).then((d) => setPointData(d.merit+d.demerit));
    fetchOvertimeSummary(sn).then((d) => setOvertimeData(d.overtime));
  }, [sn]);

  return (
    <Link href={`/soldiers?sn=${sn}`}>
      <Card>
        <div className='flex flex-row items-center justify-between'>
          <Row>
            <p className='font-bold'>
              {type === 'enlisted' ? '용사' : '간부'} {name}
            </p>
            <p className='px-1'>
              {'(**-' + '*'.repeat(sn.length - 6) + sn.slice(-3) + ')'}
            </p>
          </Row>
          {type === 'enlisted'? <Row className='font-bold'>
            <p style={{color: '#3f8600'}}>{pointData}점</p>
            <p className='px-1'>{'|'}</p>
            <p style={{color: '#3f8600', width: '70px'}}>{(overtimeData!/60).toFixed(2)}시간</p>
          </Row>
          : null}
        </div>
      </Card>
    </Link>
  );
}
