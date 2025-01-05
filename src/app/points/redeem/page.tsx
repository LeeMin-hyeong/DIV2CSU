'use client';

import {
  fetchPointSummary,
  redeemPoint,
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
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { checkIfNco } from '../give/actions';
import { debounce } from 'lodash';

export default function UsePointFormPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<{ name: string; sn: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [availablePoints, setAvailablePoints] = useState<number | null>();
  const { message } = App.useApp();
  const [target, setTarget] = useState('')

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

  const handleSearch = (value: string) => {
    debouncedSearch(value);
  };

  useEffect(() => {
    setSearching(true);
    searchEnlisted(query).then((value) => {
      setSearching(false);
      setOptions(value);
    });
  }, [query]);

  const handleSubmit = useCallback(
    async (newForm: any) => {
      await form.validateFields();
      setLoading(true);
      redeemPoint({
        ...newForm,
        value: newForm.value,
      })
        .then(({ message: newMessage }) => {
          if (newMessage) {
            message.error(newMessage);
          }
          message.success('상점을 성공적으로 사용했습니다');
          router.push('/points');
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
        >
          <DatePicker
            defaultValue={dayjs().locale('ko')}
            disabled
            picker='date'
            inputReadOnly
          />
        </Form.Item>
        <Form.Item<string>
          label={'사용 대상자' + (target !== '' ? `: ${target}` : '')}
          name={'userId'}
          rules={[
            { required: true, message: '수령자를 입력해주세요' },
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
            onChange={async (value: string) => {
              const selectedOption = options.find((t) => t.sn === value);
              setTarget(selectedOption ? selectedOption.name : ''); // 선택된 sn에 대응하는 name 설정
              const { merit, usedMerit, demerit } = await fetchPointSummary(value);
              setAvailablePoints(merit - usedMerit + demerit);
            }}
            onSearch={handleSearch}
          >
            <Input.Search loading={searching} />
          </AutoComplete>
        </Form.Item>
        <Form.Item<number>
          name='value'
          rules={[
            { required: true, message: '상벌점을 입력해주세요' },
            {
              validator: (_, value) => {
                if (value != null && availablePoints != null && value > availablePoints) {
                  return Promise.reject(new Error('입력 값이 사용 가능한 상점을 초과했습니다.'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber<number>
            min={1}
            controls
            addonAfter={
              availablePoints != null ? `/ ${availablePoints}점` : '점'
            }
            type='number'
            inputMode='numeric'
            onChange={(value) => {
              if(value != null && value == 16){
                form.setFieldValue('reason', '포상 외출 사용')
              }
              else if(value != null && value == 32){
                form.setFieldValue('reason', '포상 외박 사용')
              }
              else if(value != null && value % 48 == 0){
                form.setFieldValue('reason', `포상 휴가 ${Math.floor(value/48)}일 사용`)
              }
              else{
                form.setFieldValue('reason', null)
              }
            }}
          />
        </Form.Item>
        <Form.Item<string>
          name='reason'
          rules={[{ required: true, message: '지급이유를 입력해주세요' }]}
        >
          <Input.TextArea
            showCount
            maxLength={500}
            placeholder='상벌점 사용 이유'
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
