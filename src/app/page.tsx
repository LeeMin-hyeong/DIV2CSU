import { currentSoldier, fetchPointsCountsEnlisted, fetchPointsCountsNco } from "./actions";
import { hasPermission } from "./actions/utils";
import { TotalPointBox } from "./points/components";
import { Card } from "antd";
import Link from "next/link";

export default async function Home() {
  const user = await currentSoldier();

  if(user.type == 'nco'){
    const {approved, pending, needApprove, rejected} = await fetchPointsCountsNco();
    return (
      <div>
        <p className='font-bold px-2 py-2'>상점 요청 요약</p>
        <Link href={`/points`}>
          {hasPermission(user.permissions, ['Admin', 'Commander']) ? 
            <Card className='my-1 mx-1'>
              <div className='flex flex-row items-center justify-between'>
                <p className='font-bold'> 최종 승인 대기중인 상벌점 요청 </p>
                <p className='font-bold'> { needApprove } 건 </p>
              </div>
            </Card>
          : null}
          <Card className='my-1 mx-1'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 승인 대기중인 상벌점 요청 </p>
              <p className='font-bold'> { pending } 건 </p>
            </div>
          </Card>
          <Card className='my-1 mx-1'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 반려한 상벌점 요청 </p>
              <p className='font-bold'> { rejected } 건 </p>
            </div>
          </Card>
        </Link>
      </div>
    );
  } else {
    const {approved, pending, needApprove, rejected} = await fetchPointsCountsEnlisted();
    return (
      <Link href={`/points`}>
        <TotalPointBox user={user as any}/>
        <Card className='my-1 mx-1'>
          <div className='flex flex-row items-center justify-between'>
            <p className='font-bold'> 지휘관 승인 대기중인 상벌점 요청 </p>
            <p className='font-bold'> { needApprove } 건 </p>
          </div>
        </Card>
        <Card className='my-1 mx-1'>
          <div className='flex flex-row items-center justify-between'>
            <p className='font-bold'> 수여자 승인 대기중인 상벌점 요청 </p>
            <p className='font-bold'> { pending } 건 </p>
          </div>
        </Card>
        <Card className='my-1 mx-1'>
          <div className='flex flex-row items-center justify-between'>
            <p className='font-bold'> 반려된 상벌점 요청 </p>
            <p className='font-bold'> { rejected } 건 </p>
          </div>
        </Card>
      </Link>
    );
  }
}