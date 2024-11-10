'use server';

import { sql } from 'kysely';
import { kysely } from './kysely';
import { currentSoldier, fetchSoldier } from './soldiers';
import { checkIfSoldierHasPermission, hasPermission } from './utils';
import { log } from 'console';
import moment from 'moment';

export async function fetchOvertime(overtimeId: number) {
  return kysely
    .selectFrom('overtimes')
    .where('id', '=', overtimeId)
    .leftJoin('soldiers as g', 'g.sn', 'overtimes.giver_id')
    .leftJoin('soldiers as r', 'r.sn', 'overtimes.receiver_id')
    .leftJoin('soldiers as a', 'a.sn', 'overtimes.approver_id')
    .selectAll(['overtimes'])
    .select(['r.name as receiver', 'g.name as giver', 'a.name as approver'])
    .executeTakeFirst();
}

export async function listOvertimes(sn: string, page: number = 0) {
  const { type } = await kysely
    .selectFrom('soldiers')
    .where('sn', '=', sn)
    .select('type')
    .executeTakeFirstOrThrow();
  const query = kysely
    .selectFrom('overtimes')
    .where(type === 'enlisted' ? 'receiver_id' : 'giver_id', '=', sn);

  const [data, { count }, usedOvertimes] = await Promise.all([
    query
      .orderBy('created_at desc')
      .select(['id'])
      .limit(20)
      .offset(Math.min(0, page) * 20)
      .execute(),
    query
      .select((eb) => eb.fn.count<string>('id').as('count'))
      .executeTakeFirstOrThrow(),
    type === 'enlisted' &&
      kysely
        .selectFrom('used_overtimes')
        .where('user_id', '=', sn)
        .leftJoin('soldiers', 'soldiers.sn', 'used_overtimes.recorded_by')
        .select('soldiers.name as recorded_by')
        .selectAll(['used_overtimes'])
        .execute(),
  ]);
  return { data, count: parseInt(count, 10), usedOvertimes: usedOvertimes || null };
}

export async function fetchPendingOvertimes() {
  const { sn } = await currentSoldier();
  return kysely
    .selectFrom('overtimes')
    .where('giver_id', '=', sn!)
    .where('verified_at', 'is', null)
    .where('rejected_at', 'is', null)
    .selectAll()
    .execute();
}

export async function fetchApproveOvertimes() {
  const { sn } = await currentSoldier();
  return kysely
    .selectFrom('overtimes')
    .where('approver_id', '=', sn!)
    .where('verified_at', 'is not', null)
    .where('approved_at', 'is', null)
    .selectAll()
    .execute();
}

export async function deleteOvertime(overtimeId: number) {
  const { type, sn } = await currentSoldier();
  if (type === 'nco') {
    return { message: '간부는 초과근무를 지울 수 없습니다' };
  }
  const overtime = await fetchOvertime(overtimeId);
  if (overtime == null) {
    return { message: '초과근무가 존재하지 않습니다' };
  }
  if (overtime.receiver_id !== sn) {
    return { message: '본인 초과근무만 삭제 할 수 있습니다' };
  }
  if (overtime.approved_at) {
    return { message: '이미 승인, 반려된 초과근무는 지울 수 없습니다' };
  }
  try {
    await kysely
      .deleteFrom('overtimes')
      .where('id', '=', overtimeId)
      .executeTakeFirstOrThrow();
  } catch (e) {
    return { message: '알 수 없는 오류가 발생했습니다' };
  }
  return { message: null };
}

export async function verifyOvertime(
  overtimeId: number,
  value: boolean,
  rejectReason?: string,
) {
  const [overtime, current] = await Promise.all([
    fetchOvertime(overtimeId),
    currentSoldier(),
  ]);
  if (overtime == null) {
    return { message: '본 초과근무가 존재하지 않습니다' };
  }
  if (overtime.giver_id !== current.sn) {
    return { message: '본인한테 요청된 초과근무만 승인/반려 할 수 있십니다' };
  }
  if (current.type === 'enlisted') {
    return { message: '용사는 초과근무를 승인/반려 할 수 없습니다' };
  }
  if (!value && rejectReason == null) {
    return { message: '반려 사유를 입력해주세요' };
  }
  if (value) {
    const { message } = checkIfSoldierHasPermission(
      overtime.value,
      current.permissions,
    );
    if (message) {
      return { message };
    }
  }
  try {
    await kysely
      .updateTable('overtimes')
      .where('id', '=', overtimeId)
      .set({
        verified_at: value ? new Date() : null,
        rejected_at: !value ? new Date() : null,
        rejected_reason: rejectReason,
      })
      .executeTakeFirstOrThrow();
    return { message: null };
  } catch (e) {
    return { message: '승인/반려에 실패하였습니다' };
  }
}

export async function approveOvertime(
  overtimeId: number,
  value: boolean,
  disapprovedReason?: string,
) {
  const [overtime, current] = await Promise.all([
    fetchOvertime(overtimeId),
    currentSoldier(),
  ]);
  if (overtime == null) {
    return { message: '본 초과근무가 존재하지 않습니다' };
  }
  if (overtime.approver_id !== current.sn) {
    return { message: '본인한테 요청된 초과근무만 승인/반려 할 수 있십니다' };
  }
  if (current.type === 'enlisted') {
    return { message: '용사는 초과근무를 승인/반려 할 수 없습니다' };
  }
  if (!value && disapprovedReason == null) {
    return { message: '반려 사유를 입력해주세요' };
  }
  if (value) {
    const { message } = checkIfSoldierHasPermission(
      overtime.value,
      current.permissions,
    );
    if (message) {
      return { message };
    }
  }
  try {
    await kysely
      .updateTable('overtimes')
      .where('id', '=', overtimeId)
      .set({
        approved_at: value ? new Date() : null,
        disapproved_at: !value ? new Date() : null,
        disapproved_reason: disapprovedReason,
      })
      .executeTakeFirstOrThrow();
    return { message: null };
  } catch (e) {
    return { message: '승인/반려에 실패하였습니다' };
  }
}

export async function fetchOvertimeSummary(sn: string) {
  const overtimesQuery = kysely.selectFrom('overtimes').where('receiver_id', '=', sn);
  const usedOvertimesQuery = kysely
    .selectFrom('used_overtimes')
    .where('user_id', '=', sn);
  const [overtimeData, usedOvertimeData] = await Promise.all([
    overtimesQuery
      .where('value', '>', 0)
      .where('verified_at', 'is not', null)
      .where('approved_at', 'is not', null)
      .select((eb) => eb.fn.sum<string>('value').as('value'))
      .executeTakeFirst(),
    usedOvertimesQuery
      .where('value', '>', 0)
      .select((eb) => eb.fn.sum<string>('value').as('value'))
      .executeTakeFirst(),
  ]);
  return {
    overtime: parseInt(overtimeData?.value ?? '0', 10),
    usedOvertime: parseInt(usedOvertimeData?.value ?? '0', 10),
  };
}


export async function createOvertime({
  value,
  giverId,
  receiverId,
  approverId,
  reason,
  givenAt,
  startedDate,
  startedTime,
  endedDate,
  endedTime,
}: {
  value: number;
  giverId?: string | null;
  receiverId?: string | null;
  approverId?: string;
  reason: string;
  givenAt: Date;
  startedDate: Date;
  startedTime: Date;
  endedDate: Date;
  endedTime: Date;
}) {
  if (reason.trim() === '') {
    return { message: '초과근무 내용을 작성해주세요' };
  }
  const { type, sn, permissions } = await currentSoldier();
  if (giverId == null) {
    return { message: '지시자를 입력해주세요' };
  }
  const target = await fetchSoldier(giverId!);
  if (target.sn == null) {
    return { message: '지시자가 존재하지 않습니다' };
  }
  const approver = await fetchSoldier(approverId!);
  if (approver.sn == null) {
    return { message: '확인관이 존재하지 않습니다' }
  }
  if (giverId === sn) {
    return { message: '스스로에게 수여할 수 없습니다' };
  }
  const startedDateTime = new Date(
    new Date(startedDate).getFullYear(),
    new Date(startedDate).getMonth(),
    new Date(startedDate).getDate(),
    new Date(startedTime).getHours()+9,
    new Date(startedTime).getMinutes()
  );
  
  const endedDateTime = new Date(
    new Date(endedDate).getFullYear(),
    new Date(endedDate).getMonth(),
    new Date(endedDate).getDate(),
    new Date(endedTime).getHours()+9,
    new Date(endedTime).getMinutes()
  );
  // const endDateTime = moment(`${endedDate} ${endedTime}`, 'YYYY-MM-DD HH:mm');
  const duration = Math.floor((endedDateTime.valueOf() - startedDateTime.valueOf())/60000);
  const startedAt = startedDateTime.toISOString();
  const endedAt = endedDateTime.toISOString();
  // try {
    await kysely
      .insertInto('overtimes')
      .values({
        // created_at:  new Date(),
        receiver_id: sn!,
        giver_id:    giverId!,
        approver_id: approverId,
        reason:      reason,
        value:       duration,
        verified_at: null,
        started_at:  startedAt,
        ended_at:    endedAt,
      })
      .executeTakeFirstOrThrow();
    return { message: null };
  // } catch (e) {
  //   return { message: '알 수 없는 오류가 발생했습니다' };
  // }
}

export async function redeemOvertime({
  value,
  userId,
  // reason,
}: {
  value: number;
  userId: string;
  // reason: string;
}) {
  // if (reason.trim() === '') {
  //   return { message: '상벌점 사용 이유를 작성해주세요' };
  // }
  if (value !== Math.round(value)) {
    return { message: '휴가일수는 정수여야 합니다' };
  }
  if (value <= 0) {
    return { message: '1일 이상이어야합니다' };
  }
  const { type, sn, permissions } = await currentSoldier();
  if (sn == null) {
    return { message: '로그아웃후 재시도해 주세요' };
  }
  if (type === 'enlisted') {
    return { message: '용사는 초과근무을 사용할 수 없습니다' };
  }
  if (userId == null) {
    return { message: '대상을 입력해주세요' };
  }
  const target = await fetchSoldier(userId);
  if (target == null) {
    return { message: '대상이 존재하지 않습니다' };
  }
  if (!hasPermission(permissions, ['Admin', 'Commander'])) {
    return { message: '권한이 없습니다' };
  }
  try {
    const [{ total }, { used_overtimes }] = await Promise.all([
      kysely
        .selectFrom('overtimes')
        .where('receiver_id', '=', userId)
        .where('verified_at', 'is not', null)
        .where('approved_at', 'is not', null)
        .select(({ fn }) =>
          fn
            .coalesce(fn.sum<string>('overtimes.value'), sql<string>`0`)
            .as('total'),
        )
        .executeTakeFirstOrThrow(),
      kysely
        .selectFrom('used_overtimes')
        .where('user_id', '=', userId)
        .select(({ fn }) =>
          fn
            .coalesce(fn.sum<string>('used_overtimes.value'), sql<string>`0`)
            .as('used_overtimes'),
        )
        .executeTakeFirstOrThrow(),
    ]);
    if (parseInt(total, 10) - parseInt(used_overtimes, 10) < value*1440) {
      return { message: '초과근무 시간이 부족합니다' };
    }
    await kysely
      .insertInto('used_overtimes')
      .values({
        user_id: userId,
        recorded_by: sn,
        // reason,
        value,
      })
      .executeTakeFirstOrThrow();
    return { message: null };
  } catch (e) {
    return { message: '알 수 없는 오류가 발생했습니다' };
  }
}
