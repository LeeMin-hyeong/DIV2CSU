import { Permission } from '@/interfaces';
import _ from 'lodash';

export function hasPermission(
  permissions: Permission[],
  requires:    Permission[],
) {
  return !!_.intersection(requires, permissions).length;
}

export function checkIfSoldierHasPermission(value: number, scope: Permission[]) {
  if (scope.includes('Admin') || scope.includes('Commander')) {
    return { message: null };
  }
  if (!scope.includes('Nco')) {
    return { message: '상벌점을 줄 권한이 없습니다' };
  }
  return { message: null };
}
