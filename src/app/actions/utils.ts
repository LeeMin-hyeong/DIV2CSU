import { Permission } from '@/interfaces';
import _ from 'lodash';
import z from 'zod';

export function hasPermission(
  permissions: Permission[],
  requires:    Permission[],
) {
  return !!_.intersection(requires, permissions).length;
}

export function validatePermission(permissions: Permission[]) {
  const { success } = z.array(Permission).safeParse(permissions);
  return success;
}

export function checkIfSoldierHasPermission(value: number, scope: Permission[]) {
  if (scope.includes('Admin') || scope.includes('Commander')) {
    return { message: null };
  }
  if (!scope.includes('Nco')) {
    return { message: '상벌점을 줄 권한이 없습니다' };
  }
  if ((value > 5 || value < -5) && !scope.includes('PointNco')) {
    return { message: '5점 이상 상벌점을 줄 권한이 없습니다' };
  }
  return { message: null };
}
