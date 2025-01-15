import { 
  currentSoldier, 
  fetchOvertimesCountsEnlisted, 
  fetchOvertimesCountsNco, 
  fetchPointsCountsEnlisted, 
  fetchPointsCountsNco,
  fetchUnverifiedSoldiersCount,
  hasPermission 
} from "./actions";
import { TotalPointBox } from "./points/components";
import { Card, Divider } from "antd";
import Link from "next/link";
import { TotalOvertimeBox } from "./overtimes/components";

export default async function Home() {
  const user = await currentSoldier();

  if(user.type == 'nco'){
    const needVerify = await fetchUnverifiedSoldiersCount()
    const point      = await fetchPointsCountsNco();
    const overtime   = await fetchOvertimesCountsNco();
    return (
      <div>
        {hasPermission(user.permissions, ['Admin', 'Commander', 'UserAdmin']) ?
        <div>
          <Link href={'/soldiers/signup'}>
            <Card className='my-1 mx-1' size='small'>
              <div className='flex flex-row items-center justify-between'>
                <p className='font-bold'> 회원가입 승인 요청 </p>
                <p className='font-bold'> { needVerify } 건 </p>
              </div>
            </Card>
          </Link>
          <Divider/>
        </div> : null}
        <Link href={`/points`}>
          {hasPermission(user.permissions, ['Admin', 'Commander']) ? 
            <Card className='my-1 mx-1' size='small'>
              <div className='flex flex-row items-center justify-between'>
                <p className='font-bold'> 최종 승인 대기중인 상벌점 요청 </p>
                <p className='font-bold'> { point.needApprove } 건 </p>
              </div>
            </Card>
          : null}
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 승인 대기중인 상벌점 요청 </p>
              <p className='font-bold'> { point.pending } 건 </p>
            </div>
          </Card>
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 반려한 상벌점 요청 </p>
              <p className='font-bold'> { point.rejected } 건 </p>
            </div>
          </Card>
        </Link>
        <Divider/>
        <Link href={'/overtimes'}>
          {hasPermission(user.permissions, ['Approver']) ?
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 확인관 승인 대기중인 초과근무 요청 </p>
              <p className='font-bold'> { overtime.needApprove } 건 </p>
            </div>
          </Card>: null}
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 지시자 승인 대기중인 초과근무 요청 </p>
              <p className='font-bold'> { overtime.pending } 건 </p>
            </div>
          </Card>
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 반려한 초과근무 요청 </p>
              <p className='font-bold'> { overtime.rejected } 건 </p>
            </div>
          </Card>
        </Link>
      </div>
    );
  } else {
    const point    = await fetchPointsCountsEnlisted();
    const overtime = await fetchOvertimesCountsEnlisted();
    return (
      <div>
        <Link href={`/points`}>
        <TotalPointBox user={user as any}/>
        <Card className='my-1 mx-1' size='small'>
          <div className='flex flex-row items-center justify-between'>
            <p className='font-bold'> 지휘관 승인 대기중인 상벌점 요청 </p>
            <p className='font-bold'> { point.needApprove } 건 </p>
          </div>
        </Card>
        <Card className='my-1 mx-1' size='small'>
          <div className='flex flex-row items-center justify-between'>
            <p className='font-bold'> 수여자 승인 대기중인 상벌점 요청 </p>
            <p className='font-bold'> { point.pending } 건 </p>
          </div>
        </Card>
        <Card className='my-1 mx-1' size='small'>
          <div className='flex flex-row items-center justify-between'>
            <p className='font-bold'> 반려된 상벌점 요청 </p>
            <p className='font-bold'> { point.rejected } 건 </p>
          </div>
        </Card>
      </Link>
        <Divider />
        <Link href={'/overtimes'}>
          <TotalOvertimeBox user={user as any}/>
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 확인관 승인 대기중인 초과근무 요청 </p>
              <p className='font-bold'> { overtime.needApprove } 건 </p>
            </div>
          </Card>
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 지시자 승인 대기중인 초과근무 요청 </p>
              <p className='font-bold'> { overtime.pending } 건 </p>
            </div>
          </Card>
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 반려된 초과근무 요청 </p>
              <p className='font-bold'> { overtime.rejected } 건 </p>
            </div>
          </Card>
        </Link>
      </div>
    );
  }
}
