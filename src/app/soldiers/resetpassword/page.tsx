'use client';

import { Permission, Soldier } from '@/interfaces';
import { LoadingOutlined, QuestionOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  FloatButton,
  Input,
  Popconfirm,
  Select,
  Spin,
  message,
} from 'antd';
import _ from 'lodash';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  currentSoldier,
  fetchSoldier,
} from '../../actions';
import {
  HelpModal,
  PasswordForm,
} from '../components';

export default function ResetPasswordPage({
  searchParams: { sn },
}: {
  searchParams: { sn: string };
}) {
  const [helpShown, setHelpShwon] = useState(false);

  return (
    <div className='flex flex-1 flex-col py-2 px-3'>
      <Card>
        <div className='pb-2'>
          비밀번호가 초기화되었습니다
        </div>
        <div>
          비밀번호를 변경하시기 바랍니다
        </div>
      </Card>
      <PasswordForm sn={sn} force={true} />

      <FloatButton
        icon={<QuestionOutlined />}
        onClick={() => setHelpShwon(true)}
      />
      <HelpModal
        shown={helpShown}
        onPressClose={() => setHelpShwon(false)}
      />
    </div>
  );
}
