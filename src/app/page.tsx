import { currentSoldier} from "./actions";
import { TotalPointBox } from "./points/components";
import { TotalOvertimeBox } from "./overtimes/components";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await currentSoldier();

  return (
    <div>
      <TotalPointBox user={user as any} />
      <TotalOvertimeBox user={user as any} />
    </div>
  );
}

