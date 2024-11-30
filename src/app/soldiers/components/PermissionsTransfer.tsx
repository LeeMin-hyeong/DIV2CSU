import { Permission } from '@/interfaces';
import { Tree } from 'antd';
import { ALL_PERMISSIONS } from '../signup/constants';

export type PermissionsTransferProps = {
  permissions: Permission[];
  onChange?: (newPermissions: Permission[]) => void;
};

export function PermissionsTransfer({
  permissions,
  onChange,
}: PermissionsTransferProps) {
  return (
    <Tree
      className='my-2'
      defaultExpandAll
      checkedKeys={permissions}
      blockNode
      selectable={false}
      checkable
      checkStrictly={true}
      onCheck={(checkedInfo) => {
        const checkedKeys = Array.isArray(checkedInfo)
          ? checkedInfo
          : checkedInfo.checked;
        onChange?.(checkedKeys as Permission[]);
      }}
      treeData={[
        {
          ...ALL_PERMISSIONS.Admin,
          key: 'Admin',
          children: [
            {
              ...ALL_PERMISSIONS.Commander,
              key: 'Commander',
              children: [
                {
                  ...ALL_PERMISSIONS.UserAdmin,
                  key: 'UserAdmin',
                },
                {
                  ...ALL_PERMISSIONS.Nco,
                  key: 'Nco',
                },
              ],
            },
            {
              ...ALL_PERMISSIONS.Approver,
              key: 'Approver',
            }
          ],
        },
      ]}
    />
  );
}
