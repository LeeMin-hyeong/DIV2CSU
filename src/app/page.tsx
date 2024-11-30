import { currentSoldier, fetchPointsCountsEnlisted, fetchPointsCountsNco, fetchUnverifiedSoldiersCount, hasPermission } from "./actions";
import { TotalPointBox } from "./points/components";
import { Card, Divider } from "antd";
import Link from "next/link";

export default async function Home() {
  const user = await currentSoldier();

  if(user.type == 'nco'){
    const {verified, pending, rejected} = await fetchPointsCountsNco();
    const needVerify = await fetchUnverifiedSoldiersCount()
    return (
      <div>
        {hasPermission(user.permissions, ['Admin', 'Commander', 'UserAdmin']) ?
        <div>
          <Link href={'/soldiers/signup'}>
            <Card className='my-1 mx-1'>
              <div className='flex flex-row items-center justify-between'>
                <p className='font-bold'> 회원가입 승인 요청 </p>
                <p className='font-bold'> { needVerify } 건 </p>
              </div>
            </Card>
          </Link>
          <Divider/>
        </div> : null}
        <Link href={`/points`}>
          <Card className='my-1 mx-1'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 승인한 상벌점 요청 </p>
              <p className='font-bold'> { verified } 건 </p>
            </div>
          </Card>
        </Link>
        <Link href={`/points`}>
          <Card className='my-1 mx-1'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 승인 대기중인 상벌점 요청 </p>
              <p className='font-bold'> { pending } 건 </p>
            </div>
          </Card>
        </Link>
        <Link href={`/points`}>
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
    const {verified, pending, rejected} = await fetchPointsCountsEnlisted();
    return (
      <Link href={`/points`}>
        <TotalPointBox user={user as any}/>
        <Card className='my-1 mx-1'>
          <div className='flex flex-row items-center justify-between'>
            <p className='font-bold'> 승인된 상벌점 요청 </p>
            <p className='font-bold'> { verified } 건 </p>
          </div>
        </Card>
        <Card className='my-1 mx-1'>
          <div className='flex flex-row items-center justify-between'>
            <p className='font-bold'> 승인 대기중인 상벌점 요청 </p>
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