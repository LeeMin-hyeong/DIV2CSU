import { Soldier } from '@/interfaces';
import { PlusOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import { currentSoldier, fetchPendingPoints, fetchRedeemedPoint, fetchSoldier, hasPermission, listPoints } from '../actions';
import {
  PointRequestList,
  PointsHistoryList,
  RedeemedPointList,
  TotalPointBox,
  UsedPointsList,
} from './components';
import { redirect } from 'next/navigation';

async function EnlistedPage({ user }: { user: Soldier; }) {
  const { data, usedPoints } = await listPoints(user?.sn);
  return (
    <div className='flex flex-1 flex-col'>
      <TotalPointBox user={user} />
      <div className='flex-1 mb-2'>
        <UsedPointsList data={usedPoints} />
        <PointsHistoryList
          type={user.type}
          data={data}
        />
      </div>
      <FloatButton
        icon={<PlusOutlined />}
        href='/points/request'
      />
    </div>
  );
}

async function NcoPage({
  user,
  showRequest,
}: {
  user: Soldier;
  showRequest: boolean;
}) {
  const { data } = await listPoints(user?.sn);
  const request = await fetchPendingPoints();
  const redeemed = await fetchRedeemedPoint(user?.sn);
  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-1 mb-2'>
        {showRequest && (
          <>
            <PointRequestList data={request}/>
          </>
        )}
        {hasPermission(user.permissions, ['Admin', 'Commander']) &&
          <RedeemedPointList data={redeemed}/>
        }
        <PointsHistoryList
          type={user.type}
          data={data}
        />
      </div>
      <FloatButton
        icon={<PlusOutlined />}
        href='/points/give'
      />
    </div>
  );
}

export default async function ManagePointsPage({
  searchParams,
}: {
  searchParams: { sn?: string; };
}) {
  const [user, current] = await Promise.all([
    searchParams.sn ? fetchSoldier(searchParams.sn) : currentSoldier(),
    currentSoldier(),
  ]);

  if(searchParams.sn && !hasPermission(current.permissions, ['Admin', 'Commander'])){
    redirect('/points')
  }
  if (user.type === 'enlisted') {
    return (
      <EnlistedPage
        user={user as any}
      />
    );
  }
  return (
    <NcoPage
      user={user as any}
      showRequest={current.sn === user.sn}
    />
  );
}