import { Soldier } from '@/interfaces';
import { PlusOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import { currentSoldier, fetchApproveOvertimes, fetchPendingOvertimes, fetchRedeemedOvertime, fetchSoldier, listOvertimes} from '../actions';
import { hasPermission } from '../actions/utils';
import {
  OvertimeRequestList,
  OvertimeHistoryList,
  TotalOvertimeBox,
  UsedOvertimeList,
  RedeemedOvertimeList,
} from './components';
import { redirect } from 'next/navigation';

async function EnlistedPage({ user }: { user: Soldier }) {
  const { data, usedOvertimes } = await listOvertimes(user?.sn);
  return (
    <div className='flex flex-1 flex-col'>
      <TotalOvertimeBox user={user} />
      <div className='flex-1 mb-2'>
        <UsedOvertimeList data={usedOvertimes as any} />
        <OvertimeHistoryList
          type={user.type}
          data={data}
        />
      </div>
      <FloatButton
        icon={<PlusOutlined />}
        href='/overtimes/request'
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
  const { data } = await listOvertimes(user?.sn);
  const request = await fetchPendingOvertimes();
  const redeemed = await fetchRedeemedOvertime(user?.sn);
  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-1 mb-2'>
        {hasPermission(user.permissions, ['Admin', 'Commander']) &&
          <RedeemedOvertimeList data={redeemed}/>
        }
        {showRequest && (
          <>
            <OvertimeRequestList type={'verify'} data={request}/>
          </>
        )}
        <OvertimeHistoryList
          type={user.type}
          data={data}
        />
      </div>
    </div>
  );
}

async function ApproverPage({
  user,
  showRequest,
}: {
  user: Soldier;
  showRequest: boolean;
}) {
  const { data } = await listOvertimes(user?.sn);
  const verify = await fetchPendingOvertimes();
  const approve = await fetchApproveOvertimes();
  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-1 mb-2'>
        
        {showRequest && (
          <>
            <OvertimeRequestList type={'approve'} data={approve}/>
          </>
        )}
        {showRequest && (
          <>
            <OvertimeRequestList type={'verify'} data={verify}/>
          </>
        )}
        <OvertimeHistoryList
          type={user.type}
          data={data}
        />
      </div>
    </div>
  )
}

export default async function ManagePointsPage({
  searchParams,
}: {
  searchParams: { sn?: string };
}) {
  const [user, current] = await Promise.all([
    searchParams.sn ? fetchSoldier(searchParams.sn) : currentSoldier(),
    currentSoldier(),
  ]);

  if(searchParams.sn && !hasPermission(current.permissions, ['Admin', 'Commander', 'Approver'])){
    redirect('/overtimes')
  }
  if (user.type === 'enlisted') {
    return (
      <EnlistedPage
        user={user as any}
      />
    );
  }
  if (hasPermission(current.permissions, ['Approver'])){
    return (
      <ApproverPage
        user={user as any}
        showRequest={current.sn === user.sn}
      />
    )
  }
  return (
    <NcoPage
      user={user as any}
      showRequest={current.sn === user.sn}
    />
  );
}
