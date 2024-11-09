'use client';

import { QuestionOutlined } from '@ant-design/icons';
import { Card, FloatButton } from 'antd';
import { useState } from 'react';
import { HelpModal, PasswordForm } from '../components';
import { currentSoldier } from '@/app/actions';

export default async function ResetPasswordPage() {
  const [helpShown, setHelpShwon] = useState(false);
  const { sn: sn } = await currentSoldier();
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
