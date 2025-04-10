import { fetchOvertimeSummary, fetchPointSummary, fetchSoldier } from '@/app/actions';
import { Card, Row } from 'antd';
import Link from 'next/link';
import { useLayoutEffect, useState } from 'react';

export type UserCardProps = {
  sn: string;
  name: string;
  type: string;
  points: number;
  overtimes: number;
};

export function UserCard({ type, sn, name, points, overtimes }: UserCardProps) {
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
            <p style={points! < 0 ? {color: '#cf1322'} : {color: '#3f8600'}}>{points}점</p>
            <p className='px-1'>{'|'}</p>
            <p style={{color: '#3f8600', width: '70px'}}>{(overtimes!/60).toFixed(2)}시간</p>
          </Row>
          : null}
        </div>
      </Card>
    </Link>
  );
}
