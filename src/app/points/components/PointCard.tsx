'use client';

import { deletePoint, fetchPoint } from '@/app/actions';
import { ArrowRightOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Popconfirm, Skeleton, message } from 'antd';
import moment from 'moment';
import { useCallback, useLayoutEffect, useState } from 'react';

export type PointCardProps = {
  pointId: number;
};

export function PointCard({ pointId }: PointCardProps) {
  const [point, setPoint] = useState<
    Awaited<ReturnType<typeof fetchPoint>> | undefined
  >(undefined);
  const [deleted, setDeleted] = useState(false);

  const onDelete = useCallback(() => {
    deletePoint(pointId).then(({ message: newMessage }) => {
      if (newMessage == null) {
        message.success('삭제하였습니다');
        return setDeleted(true);
      }
      message.error(newMessage);
    });
  }, [pointId]);

  useLayoutEffect(() => {
    fetchPoint(pointId).then((data) => {
      setPoint(data);
    });
  }, [pointId]);

  const backgroundColor = (() => {
    if (point == null) {
      return undefined;
    }
    //벌점일 경우 빨간색
    if (point.verified_at < 0) {
      return '#ED2939';
    }
    if (point.verified_at) {
      return '#A7C0FF';
    }
    //반려됐을 경우 주황색
    if (point.rejected_at || point.rejected_reason) {
      return '#ed8429';
    }
    return '#D9D9D9';
  })();
  

  return (
    <Card
      className={deleted ? 'line-through' : ''}
      size='small'
      style={{ backgroundColor }}
      title={
        point != null ? (
          <div className='flex flex-row justify-between items-center'>
            <div className='flex flex-row align-middle'>
              <p>{point.giver}</p>
              <ArrowRightOutlined className='mx-2' />
              <p>{point.receiver}</p>
            </div>
            <p>{`${point?.value ?? 0}점`}</p>
          </div>
        ) : null
      }
    >
      <Skeleton
        active
        paragraph={{ rows: 0 }}
        loading={point == null}
      >
        <div className='flex flex-row'>
          <div className='flex-1'>
            {point?.rejected_reason && (
              <p>반려 사유: {point?.rejected_reason}</p>
            )}
            <p>
              {point?.given_at
                ? moment(point.given_at).local().format('YYYY년 MM월 DD일')
                : null}
            </p>
            <p>{point?.reason}</p>
          </div>
          {point?.rejected_at ||
          point?.verified_at ||
          point?.rejected_reason ? null : (
            <Popconfirm
              title='삭제하시겠습니까?'
              okText='삭제'
              cancelText='취소'
              onConfirm={onDelete}
            >
              <Button
                danger
                icon={<DeleteOutlined key='delete' />}
              />
            </Popconfirm>
          )}
        </div>
      </Skeleton>
    </Card>
  );
}
