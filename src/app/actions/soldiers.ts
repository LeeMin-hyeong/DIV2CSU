'use server';

import { Permission} from '@/interfaces';
import jwt from 'jsonwebtoken';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { validateSoldier } from './auth';
import { kysely } from './kysely';
import { hasPermission } from './utils';

export async function unauthenticated_currentSoldier() {
  const accessToken = cookies().get('auth.access_token')?.value;
  if (accessToken == null) {
    return null;
  }
  let jwtPayload;
  try {
    jwtPayload = jwt.verify(accessToken, process.env.JWT_SECRET_KEY!, {
      algorithms: ['HS512'],
    }) as {
      name: string;
      type: string;
      sub:  string;
    };
  } catch (e) {
    cookies().delete('auth.access_token');
    return null;
  }
  const soldier = await fetchSoldier(jwtPayload.sub);
  return soldier;
}

export async function currentSoldier() {
  const soldier = await unauthenticated_currentSoldier();
  await validateSoldier(soldier);
  return soldier!;
}

export const fetchSoldier = cache(async (sn: string) => {
  const data = await kysely
    .selectFrom('soldiers')
    .where('sn', '=', sn)
    .select((eb) => [
      'soldiers.sn',
      'soldiers.name',
      'soldiers.type',
      'soldiers.verified_at',
      'soldiers.deleted_at',
      'soldiers.rejected_at',
      jsonArrayFrom(
        eb
          .selectFrom('permissions')
          .select(['value'])
          .whereRef('permissions.soldiers_id', '=', 'soldiers.sn'),
      ).as('permissions'),
    ])
    .executeTakeFirst();
  return {
    sn:          data?.sn as string,
    name:        data?.name as string,
    type:        data?.type as ('nco' | 'enlisted'),
    verified_at: data?.verified_at as Date,
    deleted_at:  data?.deleted_at as Date,
    rejected_at: data?.rejected_at as Date,
    permissions: (data?.permissions ?? []).map(({ value }: { value: Permission }) => value),
  };
});

export async function listUnverifiedSoldiers() {
  const current = await currentSoldier();
  if (
    !hasPermission(current.permissions, ['Admin', 'UserAdmin', 'VerifyUser'])
  ) {
    return { message: '권한이 없습니다', data: null };
  }
  const data = await kysely
    .selectFrom('soldiers')
    .select(['sn', 'name', 'type'])
    .where('verified_at', 'is', null)
    .where('rejected_at', 'is', null)
    .execute();
  return { message: null, data };
}

export async function fetchUnverifiedSoldiersCount() {
  const { count } = await kysely
    .selectFrom('soldiers')
    .where('verified_at', 'is', null)
    .where('rejected_at', 'is', null)
    .select((eb) => eb.fn.count<number>('sn').as('count'))
    .executeTakeFirstOrThrow();
  return count;
}

export async function verifySoldier(sn: string, value: boolean) {
  try {
    const current = await currentSoldier();
    if (
      !hasPermission(current.permissions, ['Admin', 'UserAdmin', 'VerifyUser'])
    ) {
      return {
        success: false,
        message: '권한이 없습니다',
      };
    }
    await kysely
      .updateTable('soldiers')
      .where('sn', '=', sn)
      .set(
        value
          ? { verified_at: new Date(), rejected_at: null }
          : { rejected_at: new Date(), verified_at: null },
      )
      .executeTakeFirstOrThrow();
    return {
      success: true,
      message: value ? '승인되었습니다' : '반려되었습니다',
    };
  } catch (e) {
    return { success: false, message: '실패하였습니다' };
  }
}

export async function listSoldiers({ query }: { query?: string | null }) {
  return kysely
    .selectFrom('soldiers')
    .where((eb) =>
      eb.and([
        eb.or([eb('sn', 'like', `%${query}%`), eb('name', 'like', `%${query}%`)]),
        eb.or([
          eb('rejected_at', 'is not', null),
          eb('verified_at', 'is not', null),
        ]),
        eb('deleted_at', 'is', null), // 삭제된 유저 제외
      ]),
    )
    .selectAll()
    .execute();
}

export async function GroupSoldiers() {
  const query = kysely
    .selectFrom('soldiers')
    .where('rejected_at', 'is', null)
    .where('verified_at', 'is not', null)
    .where('deleted_at', 'is', null);
    const [ headquarters, supply, medical, transport, unclassified ] = await Promise.all([
      query
        .where('unit', '=', 'headquarters')
        .orderBy('type desc')
        .selectAll()
        .execute(),
      query
        .where('unit', '=', 'supply')
        .orderBy('type desc')
        .selectAll()
        .execute(),
      query
        .where('unit', '=', 'medical')
        .orderBy('type desc')
        .selectAll()
        .execute(),
      query
        .where('unit', '=', 'transport')
        .orderBy('type desc')
        .selectAll()
        .execute(),
      query
        .where('unit', 'is', null)
        .orderBy('type desc')
        .selectAll()
        .execute(),
  ]);
  return { headquarters, supply, medical, transport, unclassified };
}

export async function searchPointsReceiver(query: string) {
  return kysely
    .selectFrom('soldiers')
    .where((eb) =>
      eb.and([
        eb('type', '=', 'enlisted'),
        eb.or([
          eb('sn', 'like', `%${query}%`),
          eb('name', 'like', `%${query}%`),
        ]),
        eb.or([
          eb('rejected_at', 'is not', null),
          eb('verified_at', 'is not', null),
        ]),
      ]),
    )
    .select(['sn', 'name'])
    .execute();
}

export async function searchPointsGiver(query: string) {
  return kysely
    .selectFrom('soldiers')
    .where((eb) =>
      eb.and([
        eb('type', '=', 'nco'),
        eb.or([
          eb('sn', 'like', `%${query}%`),
          eb('name', 'like', `%${query}%`),
        ]),
        eb.or([
          eb('rejected_at', 'is not', null),
          eb('verified_at', 'is not', null),
        ]),
        eb.exists(
          eb
            .selectFrom('permissions')
            .whereRef('permissions.soldiers_id', '=', 'soldiers.sn')
            .having('value', 'in', [
              'GiveMeritPoint',
              'GiveLargeMeritPoint',
              'GiveDemeritPoint',
              'GiveLargeDemeritPoint',
              'PointAdmin',
              'Admin',
            ])
            .select('permissions.value')
            .groupBy('permissions.value'),
        ),
      ]),
    )
    .select(['sn', 'name'])
    .execute();
}

export async function deleteSoldier({
  sn,
  value,
}: {
  sn:    string;
  value: boolean;
}) {
  const { sn: requestSn, permissions } = await currentSoldier();
  if (sn == null) {
    return { message: 'sn(군번) 값이 없습니다' };
  }
  if (value == null) {
    return { message: 'value 값이 없습니다' };
  }
  if (requestSn === sn) {
    return { message: '본인은 삭제할 수 없습니다' };
  }
  const target = await fetchSoldier(sn);
  if (target.permissions.includes('Admin')) {
    return { message: '관리자는 삭제할 수 없습니다' };
  }
  if (!hasPermission(permissions, ['Admin', 'UserAdmin', 'DeleteUser'])) {
    return { message: '유저 삭제 권한이 없습니다' };
  }
  await kysely
    .updateTable('soldiers')
    .where('sn', '=', sn)
    .set({ deleted_at: value ? new Date() : null })
    .executeTakeFirstOrThrow();
  return { message: null };
}

