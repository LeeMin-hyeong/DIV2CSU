import z from 'zod';

/**
 * Admin 권한은 보안상 DB에서만 직접 수정할 수 있습니다.
 * 
 * 권한 관련 API는 actions/permissions.ts에서 사용할 수 있습니다.
 */

/**
 * 시스템에서 권한을 나타냅니다.
 * 
 * Admin: 모든 권한을 가지고 있습니다.
 * 
 * UserAdmin: User가 붙은 모든 권한을 가지고 있습니다. (Admin에게는 행사 제외)
 * 
 * DeleteUser: 사용자 삭제 권한입니다. (Admin 및 본인 제외)
 * 
 * VerifyUser: 사용자 승인 권한입니다. (Admin 포함)
 * 
 * GivePermissionUser: 권한을 부여할 수 있는 권한입니다. (Admin 권한은 부여 및 제거 불가)
 * 
 * ResetPasswordUser: 다른 유저 비밀번호 초기화 권한입니다. (Admin 권한은 부여 및 제거 불가)
 * 
 * PointAdmin: Point가 붙은 모든 권한 소유.
 * 
 * ViewPoint: 포인트 조회 권한입니다.
 * 
 * GiveMeritPoint: 상점 부여 권한입니다 (5점 미만).
 * 
 * GiveLargeMeritPoint: 5점 이상 상점 부여 권한입니다.
 * 
 * GiveDemeritPoint: 벌점 부여 권한입니다 (5점 미만).
 * 
 * GiveLargeDemeritPoint: 5점 이상 벌점 부여 권한입니다.
 * 
 * UsePoint: 포인트를 휴가 및 외박등으로 상점을 사용했는지에 대한 여부를 기록할 수 있는 권한입니다 (예: 중대장).
 */

export const Permission = z.enum([
  'Admin',
  'Commander',
  'UserAdmin',
  'DeleteUser',
  'VerifyUser',
  'GivePermissionUser',
  'ResetPasswordUser',
  'PointAdmin',
  'ViewPoint',
  'GiveMeritPoint',
  'GiveLargeMeritPoint',
  'GiveDemeritPoint',
  'GiveLargeDemeritPoint',
  'UsePoint',
]);

export const Permissions = z.object({
  id:          z.string().uuid(),
  created_at:  z.date(),
  soldiers_id: z.string(),
  value:       Permission,
});

export type Permission = z.infer<typeof Permission>;
export type Permissions = z.infer<typeof Permissions>;
