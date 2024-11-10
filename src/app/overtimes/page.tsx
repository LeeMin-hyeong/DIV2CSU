import { Soldier } from '@/interfaces';
import { PlusOutlined } from '@ant-design/icons';
import { Divider, FloatButton } from 'antd';
import { currentSoldier, fetchSoldier, listOvertimes} from '../actions';
import { hasPermission } from '../actions/utils';
import {
  OvertimeListPagination,
  OvertimeRequestList,
  OvertimeHistoryList,
  TotalOvertimeBox,
  UsedPointsHorizontalList,
  OvertimeApproveList,
} from './components';

async function EnlistedPage({ user, page }: { user: Soldier; page: number }) {
  const { data, count, usedOvertimes } = await listOvertimes(user?.sn, page);
  return (
    <div className='flex flex-1 flex-col'>
      <TotalOvertimeBox user={user} />
      <div className='flex-1 mb-2'>
        <UsedPointsHorizontalList data={usedOvertimes as any} />
        <OvertimeHistoryList
          type={user.type}
          data={data}
        />
      </div>
      <OvertimeListPagination
        sn={user.sn}
        total={count}
        page={page}
      />
      <FloatButton
        icon={<PlusOutlined />}
        href='/overtimes/request'
      />
    </div>
  );
}

async function NcoPage({
  user,
  page,
  showRequest,
}: {
  user: Soldier;
  page: number;
  showRequest: boolean;
}) {
  const { data, count } = await listOvertimes(user?.sn, page);

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-1 mb-2'>
        {showRequest && (
          <>
            <OvertimeRequestList />
            <Divider />
          </>
        )}
        <OvertimeHistoryList
          type={user.type}
          data={data}
        />
      </div>
      <Divider />
      <OvertimeListPagination
        sn={user.sn}
        total={count}
        page={page}
      />
      {/* <FloatButton
        icon={<PlusOutlined />}
        href='/points/give'
      /> */}
    </div>
  );
}

async function CommanderPage({
  user,
  page,
  showRequest,
}: {
  user: Soldier;
  page: number;
  showRequest: boolean;
}) {
  const { data, count } = await listOvertimes(user?.sn, page);

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-1 mb-2'>
        {showRequest && (
          <>
            <OvertimeApproveList />
            <Divider />
          </>
        )}
        {showRequest && (
          <>
            <OvertimeRequestList />
            <Divider />
          </>
        )}
        <OvertimeHistoryList
          type={user.type}
          data={data}
        />
      </div>
      <Divider />
      <OvertimeListPagination
        sn={user.sn}
        total={count}
        page={page}
      />
      {/* <FloatButton
        icon={<PlusOutlined />}
        href='/points/give'
      /> */}
    </div>
  )
}

export default async function ManagePointsPage({
  searchParams,
}: {
  searchParams: { sn?: string; page?: string };
}) {
  const [user, profile] = await Promise.all([
    searchParams.sn ? fetchSoldier(searchParams.sn) : currentSoldier(),
    currentSoldier(),
  ]);
  const page = parseInt(searchParams?.page ?? '1', 10) || 1;

  if (user.type === 'enlisted') {
    return (
      <EnlistedPage
        user={user as any}
        page={page}
      />
    );
  }
  if (hasPermission(profile.permissions, ['Admin', 'Commander'])){
    return (
      <CommanderPage
        user={user as any}
        page={page}
        showRequest={profile.sn === user.sn}
      />
    )
  }
  return (
    <NcoPage
      user={user as any}
      page={page}
      showRequest={profile.sn === user.sn}
    />
  );
}
