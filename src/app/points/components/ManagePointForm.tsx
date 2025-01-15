'use client';

import {
  createPoint,
  searchEnlisted,
  searchNco,
  searchCommander,
  searchTargetCommander,
} from '@/app/actions';
import {
  App,
  AutoComplete,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
} from 'antd';
import locale from 'antd/es/date-picker/locale/ko_KR';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { PointTemplatesInput } from '../components';
import { checkIfNco } from '../give/actions';

export type ManagePointFormProps = {
  type: 'request' | 'give';
};

export function ManagePointForm({ type }: ManagePointFormProps) {
  const [merit, setMerit] = useState(1);
  const [form] = Form.useForm();
  const router = useRouter();
  const [soldierQuery, setSoldierQuery] = useState('');
  const [commanderQuery, setCommanderQuery] = useState('');
  const [soldierOptions, setSoldierOptions] = useState<{ name: string; sn: string }[]>([]);
  const [commanderOptions, setCommanderOptions] = useState<{ name: string; sn: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const { message } = App.useApp();
  const [target, setTarget] = useState('')
  const [targetSn, setTargetSn] = useState('')
  const [commander, setCommander] = useState('')

  const renderPlaceholder = useCallback(
    ({ name, sn }: { name: string; sn: string }) => (
      <div className='flex flex-row justify-between'>
        <span className='text-black'>{name}</span>
        <span className='text-black'>{sn}</span>
      </div>
    ),
    [],
  );

  useEffect(() => {
    if (type === 'give') {
      checkIfNco();
    }
  }, [type]);

  const debouncedSearch = useMemo(() => ({
    soldier: debounce((value) => setSoldierQuery(value), 300),
    commander: debounce((value) => setCommanderQuery(value), 300),
  }), []);

  useEffect(() => {
    setSearching(true);
    const searchFn =
      type === 'request' ? searchNco : searchEnlisted;

    searchFn(soldierQuery).then((value) => {
      setSearching(false);
      setSoldierOptions(value);
    });
  }, [soldierQuery, type]);

  useEffect(() => {
    setSearching(true);
    searchCommander(commanderQuery || '').then((value) => {
      setSearching(false);
      setCommanderOptions(value as any);
    });

  }, [commanderQuery]);

  const handleSubmit = useCallback(
    async (newForm: any) => {
      await form.validateFields();
      setLoading(true);
      createPoint({
        ...newForm,
        value: merit * newForm.value,
        givenAt: (newForm.givenAt.$d as Date),
      })
        .then(({ message: newMessage }) => {
          if (newMessage) {
            message.error(newMessage);
          } else {
            message.success(
              type === 'request'
                ? '상벌점 요청을 성공적으로 했습니다'
                : '상벌점을 성공적으로 부여했습니다',
            );
            router.push('/points');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [router, merit, form, message, type],
  );

  useEffect(() => {
    if(type === 'request'){
      searchTargetCommander().then((value) => {
        if (value.length === 1) {
          form.setFieldsValue({ commanderId: value[0].sn });
          setCommander(value[0].name);
        }
      });
    }
  }, [form, type]);

  useEffect(() => {
    if(type === 'give' && targetSn !== ''){
      searchTargetCommander(targetSn).then((value) => {
        if (value.length === 1) {
          form.setFieldsValue({ commanderId: value[0].sn });
          setCommander(value[0].name);
        } else {
          form.setFieldsValue({ commanderId: ''});
          setCommander('');
        }
      });
    }
  }, [targetSn, type]);

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
          rules={[{ required: true, message: '받은 날짜를 입력해주세요' }]}
        >
          <DatePicker
            placeholder='상벌점을 받은 날짜를 선택해주세요'
            picker='date'
            inputReadOnly
            locale={locale}
          />
        </Form.Item>
        <Form.Item<string>>
          <PointTemplatesInput
            onChange={(reason, value) => {
              form.setFieldValue('reason', reason);
              if (value) {
                setMerit(() => (value > 0 ? 1 : -1));
                form.setFieldValue('value', Math.abs(value));
              }
            }}
          />
        </Form.Item>
        <Form.Item<string>
          label={(type === 'request' ? '수여자' : '수령자') + (target !== '' ? `: ${target}` : '')}
          name={type === 'request' ? 'giverId' : 'receiverId'}
          rules={[
            { required: true, message: `${type === 'request' ? '수여자' : '수령자'}를 입력해주세요` },
            { pattern: /^[0-9]{2}-[0-9]{5,8}$/, message: '잘못된 군번입니다' },
          ]}
        >
          <AutoComplete
            options={soldierOptions.map((t) => ({
              value: t.sn,
              label: renderPlaceholder(t),
            }))}
            onSearch={debouncedSearch.soldier}
            onChange={(value) => {
              setTargetSn(value);
              const selectedOption = soldierOptions.find((t) => t.sn === value);
              setTarget(selectedOption ? selectedOption.name : '');
            }}
          >
            <Input.Search loading={searching} />
          </AutoComplete>
        </Form.Item>
        <Form.Item<string>
          label={commander !== '' ? `승인자: ${commander}` : '승인자'}
          name='commanderId'
          rules={[
            { required: true, message: '승인자를 입력해주세요' },
            { pattern: /^[0-9]{2}-[0-9]{5,8}$/, message: '잘못된 군번입니다' },
          ]}
        >
          <AutoComplete
            options={commanderOptions.map((t) => ({
              value: t.sn,
              label: renderPlaceholder(t),
            }))}
            onChange={(value) => {
              const selectedOption = commanderOptions.find((t) => t.sn === value);
              setCommander(selectedOption ? selectedOption.name : '');
            }}
            getPopupContainer={c => c.parentElement}
            onSearch={debouncedSearch.commander}
          >
            <Input.Search loading={searching} />
          </AutoComplete>
        </Form.Item>
        <Form.Item<number>
          name='value'
          rules={[{ required: true, message: '상벌점을 입력해주세요' }]}
        >
          <InputNumber
            min={1}
            controls
            addonAfter='점'
            type='number'
            inputMode='numeric'
            addonBefore={
              <Select
                value={merit}
                onChange={useCallback((value: number) => setMerit(value), [])}
              >
                <Select.Option value={1}>상점</Select.Option>
                <Select.Option value={-1}>벌점</Select.Option>
              </Select>
            }
          />
        </Form.Item>
        <Form.Item<string>
          name='reason'
          rules={[{ required: true, message: '지급이유를 입력해주세요' }]}
        >
          <Input.TextArea
            showCount
            maxLength={500}
            placeholder='상벌점 지급 이유'
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
            {type === 'request' ? '요청하기' : '부여하기'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
