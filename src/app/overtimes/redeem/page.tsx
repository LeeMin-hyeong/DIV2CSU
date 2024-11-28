'use client';

import {
  currentSoldier,
  fetchOvertimeSummary,
  redeemOvertime,
  searchEnlisted,
} from '@/app/actions';
import {
  App,
  AutoComplete,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { debounce } from 'lodash';
import { redirect, useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';

export async function checkIfNco() {
  const data = await currentSoldier();
  if (data?.type === 'enlisted') {
    redirect('/points/request');
  }
}

export default function UsePointFormPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<{ name: string; sn: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [availableOvertimes, setAvailableOvertimes] = useState<number | null>();
  const { message } = App.useApp();

  const renderPlaceholder = useCallback(
    ({ name, sn }: { name: string; sn: string }) => (
      <div className='flex flex-row justify-between'>
        <span className='text-black'>{name}</span>
        <span className='text-black'>{sn}</span>
      </div>
    ),
    [],
  );

  useLayoutEffect(() => {
    checkIfNco();
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setQuery(value);
      }, 300),
    [],
  );

  // const handleSearch = (value: string) => {
  //   debouncedSearch(value);
  // };

  useEffect(() => {
    setSearching(true);
    searchEnlisted(query || '').then((value) => {
      setSearching(false);
      setOptions(value);
    });
  }, [query]);

  const handleSubmit = useCallback(
    async (newForm: any) => {
      await form.validateFields();
      setLoading(true);
      redeemOvertime({
        ...newForm,
        value: newForm.value,
      })
        .then(({ message: newMessage }) => {
          if (newMessage) {
            message.error(newMessage);
          } else {
            message.success('초과근무를 성공적으로 사용했습니다');
          }
          router.push('/overtimes');
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [router, form, message],
  );

  return (
    <div className='px-4'>
      <div className='my-5' />
      <Form
        form={form}
        onFinish={handleSubmit}
      >
        <Form.Item
          name='givenAt'
          label='받은 날짜'
          colon={false}
          initialValue={dayjs().locale('ko')}
        >
          <DatePicker
            disabled
            picker='date'
            inputReadOnly
          />
        </Form.Item>
        <Form.Item<string>
          label={'사용 대상자'}
          name={'userId'}
          rules={[
            { required: true, message: '대상자를 입력해주세요' },
            {
              pattern: /^[0-9]{2}-[0-9]{5,8}$/,
              message: '잘못된 군번입니다',
            },
          ]}
        >
          <AutoComplete
            options={options.map((t) => ({
              value: t.sn,
              label: renderPlaceholder(t),
            }))}
            onChange={async (value) => {
              const { overtime, usedOvertime } = await fetchOvertimeSummary(
                value,
              );
              setAvailableOvertimes(Math.floor((overtime - usedOvertime*1440)/1440));
            }}
            onSearch={debouncedSearch}
          >
            <Input.Search loading={searching} />
          </AutoComplete>
        </Form.Item>
        <Form.Item<number>
          name='value'
          rules={[{ required: true, message: '휴가 일수를 입력해주세요' }]}
        >
          <InputNumber
            min={1}
            controls
            addonAfter={
              availableOvertimes != null ? `/ ${availableOvertimes}일` : '일'
            }
            type='number'
            inputMode='numeric'
            onChange={(day) => form.setFieldValue('reason', day ? `초과근무 위로휴가 ${day}일 발급` : null)}
          />
        </Form.Item>
        <Form.Item<string>
          name='reason'
          rules={[{ required: true, message: '지급이유를 입력해주세요' }]}
        >
          <Input.TextArea
            showCount
            // disabled
            maxLength={500}
            placeholder='초과근무 사용 이유'
            style={{ height: 150 }}
          />
        </Form.Item>
        <Form.Item>
          <Button
            ghost={false}
            htmlType='submit'
            type='primary'
            loading={loading}
          >
            사용하기
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
