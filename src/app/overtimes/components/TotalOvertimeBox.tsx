'use client';
import { fetchOvertimeSummary } from '@/app/actions';
import { Soldier } from '@/interfaces';
import { CheckOutlined, ClockCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { Card, Row, Skeleton, Statistic, Progress, Flex, Divider } from 'antd';
import { redirect, useRouter } from 'next/navigation';
import { useLayoutEffect, useState } from 'react';

export function TotalOvertimeBox({ user }: { user: Soldier }) {
  const router = useRouter();
  const [data, setData] = useState<Awaited<
    ReturnType<typeof fetchOvertimeSummary>
  > | null>(null);

  useLayoutEffect(() => {
    fetchOvertimeSummary(user.sn).then(setData);
  }, [user.sn]);

  return (
    <div onClick={() => {router.push('/overtimes')}}>
      <Card className='flex-1'>
        <Skeleton
          paragraph={{ rows: 1 }}
          active
          loading={data == null}
        >
          {data ? (
            <div>
              <span className='mx-2' style={{fontWeight: 'bold'}}>초과근무</span>
              <span className='mx-2' style={{fontWeight: 'bold'}}>
                {(data.overtime >= 1440) ? Math.floor(data.overtime/1440)+'일 ' : ''} 
                {Math.floor(data.overtime%1440/60)+'시간 '}
                {data.overtime%1440%60+'분'}
              </span>
              <Divider/>
              <Flex vertical={false}>
                <ClockCircleOutlined className='mx-2'/>
                <Progress className='mx-2'
                  percent={Math.round(data.overtime%1440 / 1440 * 100)}
                  strokeColor={ '#3f8600' }
                  />
              </Flex>
            </div>
          ) : null}
        </Skeleton>
      </Card>
    </div>
  );
}
