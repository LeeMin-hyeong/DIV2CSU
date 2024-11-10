import z from 'zod';

export const Overtime = z.object({
  id:                 z.string().uuid(),
  giver_id:           z.string(),
  receiver_id:        z.string(),
  approver_id:        z.string(),
  worked_at:          z.date(),
  started_at:         z.string().time(),
  ended_at:           z.string().time(),
  value:              z.number(),
  reason:             z.string(),
  created_at:         z.date(),
  verified_at:        z.date().nullable(),
  approved_at:        z.date().nullable(),
  rejected_at:        z.date().nullable(),
  rejected_reason:    z.string(),
  disapproved_at:     z.date().nullable(),
  disapproved_reason: z.string(),
});

export type Overtime = z.infer<typeof Overtime>;
