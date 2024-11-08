import z from 'zod';

export const Point = z.object({
  // 상벌점 ID
  id: z.string().uuid(),
  // 상벌점을 부여한 사용자 ID
  giver_id: z.string(),
  // 상벌점을 받은 사용자 ID
  receiver_id: z.string(),
  commander_id: z.string(),
  // 상벌점 데이터 생성일
  created_at: z.date(),
  // 상벌점 검증일
  verified_at: z.date().nullable(),
  // 상벌점 승인일
  approved_at: z.date().nullable(),
  // 상벌점 값 (양수: 상점, 음수: 벌점)
  value: z.number(),
  // 상벌점 부여 이유
  reason: z.string(),
  // 상벌점 받은 날짜
  // 예를 들어 병사가 2021년 1월 1일에 상벌점을 받았고 2021년 1월 2일에 기록하고
  // 2021년 1월 3일에 중대장님한테 승인을 받았다면
  // given_at은 2021년 1월 1일, created_at은 2021년 1월 2일, verified_at은 2021년 1월 3일이 됩니다.
  given_at: z.date(),
  //  상벌점 거절일, 거절되지 않은 경우 null
  rejected_at: z.date().nullable(),
  // 상벌점 거절 이유
  rejected_reason: z.string(),
  // 상벌점 승인 반려
  disapproved_at: z.date().nullable(),
  // 상벌점 승인 반려 이유
  disapproved_reason: z.string(),
});

export type Point = z.infer<typeof Point>;
