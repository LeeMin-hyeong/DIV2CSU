'use client';

import {
  createOvertime,
  searchApprover,
  searchNco,
} from '@/app/actions';
import {
  App,
  AutoComplete,
  Button,
  Card,
  DatePicker,
  Divider,
  Form,
  Input,
  TimePicker
} from 'antd';
import locale from 'antd/es/date-picker/locale/ko_KR';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { debounce } from 'lodash';

export function ManageOvertimeForm() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [soldierQuery, setSoldierQuery] = useState('');
  const [approverQuery, setApproverQuery] = useState('');
  const [soldierOptions, setSoldierOptions] = useState<{ name: string; sn: string }[]>([]);
  const [approverOptions, setApproverOptions] = useState<{ name: string; sn: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const { message } = App.useApp();
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [overtimeDuration, setOvertimeDuration] = useState('');
  const [giverName, setGiverName] = useState('');
  const [approverName, setApproverName] = useState('');

  const renderPlaceholder = useCallback(
    ({ name, sn }: { name: string; sn: string }) => (
      <div className='flex flex-row justify-between'>
        <span className='text-black'>{name}</span>
        <span className='text-black'>{sn}</span>
      </div>
    ),
    [],
  );

  const debouncedSearch = useMemo(() => ({
    soldier: debounce((value) => setSoldierQuery(value), 300),
    approver: debounce((value) => setApproverQuery(value), 300),
  }), []);

  useEffect(() => {
    setSearching(true);
    searchNco(soldierQuery || '').then((value) => {
      setSearching(false);
      setSoldierOptions(value);
    });
  }, [soldierQuery]);

  useEffect(() => {
    setSearching(true);
    searchApprover(approverQuery).then((value) => {
      setSearching(false);
      setApproverOptions(value);
    });
  }, [approverQuery]);

  useEffect(() => {
    if (startDate && startTime && endDate && endTime) {
      const startDateTime = moment(`${startDate} ${startTime}`, 'YYYY-MM-DD HH:mm');
      const endDateTime = moment(`${endDate} ${endTime}`, 'YYYY-MM-DD HH:mm');
      const duration = Math.floor((endDateTime.valueOf() - startDateTime.valueOf())/60000);

      if (duration > 0) {
        const hours = Math.floor(duration / 60);
        const minutes = Math.floor((duration % 60));
        setOvertimeDuration(`${hours}시간 ${minutes}분`);
      } else {
        setOvertimeDuration('0시간 0분');
      }
    }
  }, [startDate, startTime, endDate, endTime]);

  const validateEndDate = () => {
    if (startDate && startTime && endDate && endTime) {
      const startDateTime = moment(`${startDate} ${startTime}`, 'YYYY-MM-DD HH:mm')
      const endDateTime = moment(`${endDate} ${endTime}`, 'YYYY-MM-DD HH:mm')
      if (endDateTime.isSameOrBefore(startDateTime)) {
        return Promise.reject(new Error('종료일 및 종료 시각은 시작일 및 시작 시각보다 커야 합니다.'));
      }
    }
    return Promise.resolve();
  };

  const handleSubmit = useCallback(
    async (newForm: any) => {
      await form.validateFields();
      setLoading(true);
      createOvertime({
        ...newForm,
        startedDate: newForm.startedDate,
        startedTime: newForm.startedTime,
        endedDate:   newForm.endedDate,
        endedTime:   newForm.endedTime,
      })
        .then(({ message: newMessage }) => {
          if (newMessage) {
            message.error(newMessage);
          } else {
            message.success('초과근무 요청을 보냈습니다');
            router.push('/overtimes');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [router, form, message],
  );

  useEffect(() => {
    searchApprover().then((value) => {
      if (value.length === 1) {
        form.setFieldsValue({ approverId: value[0].sn });
        setApproverName(value[0].name)
      }
    });
  }, [form]);

  return (
    <div className='px-4'>
      <div className='my-5' />
      <Form
        form={form}
        onFinish={handleSubmit}
      >
        <p style={{paddingBottom:'14px'}}>
          <span style={{ color: 'red' }}>*</span> 초과근무 시작 / 종료
        </p>
        <div className='flex flex-row align-middle' id='form'>
          <Form.Item
            name='startedDate'
            colon={false}
            rules={[{ required: true, message: '초과근무 종료일을 입력해주세요' }]}
          >
            <DatePicker
              placeholder='시작일'
              format='YYYY-MM-DD'
              inputReadOnly
              locale={locale}
              onChange={(date: any) => setStartDate(date ? date.format('YYYY-MM-DD') : null)}
            />
          </Form.Item>
          <Form.Item
            name='startedTime'
            colon={false}
            rules={[{ required: true, message: '초과근무 시작시간을 입력해주세요' }]}
          >
            <TimePicker
              placeholder='시작 시각'
              format='HH:mm'
              inputReadOnly
              locale={locale}
              onChange={(time: any) => setStartTime(time ? time.format('HH:mm') : null)}
              needConfirm={false}
            />
          </Form.Item>
        </div>
        <div className='flex flex-row align-middle'>
          <Form.Item
            name='endedDate'
            colon={false}
            rules={[{ required: true, message: '초과근무 종료일을 입력해주세요' }, {validator: validateEndDate}]}
          >
            <DatePicker
              placeholder='종료일'
              format='YYYY-MM-DD'
              inputReadOnly
              locale={locale}
              onChange={(date: any) => setEndDate(date ? date.format('YYYY-MM-DD') : null)}
            />
          </Form.Item>
          <Form.Item
            name='endedTime'
            colon={false}
            rules={[{ required: true, message: '초과근무 종료시간을 입력해주세요' }, {validator: validateEndDate}]}
          >
            <TimePicker
              placeholder='종료 시각'
              format='HH:mm'
              inputReadOnly
              locale={locale}
              onChange={(time: any) => setEndTime(time ? time.format('HH:mm') : null)}
              needConfirm={false}
              />
          </Form.Item>
        </div>
        <Card className='mx-2 font-bold' id='print_overtime' size='small'>
          초과근무 {overtimeDuration}
        </Card>
        <Divider />
        <Form.Item<string>
          label={giverName !== '' ? `지시자: ${giverName}` : '지시자'}
          name='giverId'
          rules={[
            { required: true, message: '지시자를 입력해주세요' },
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
              const selectedOption = soldierOptions.find((t) => t.sn === value);
              setGiverName(selectedOption ? selectedOption.name : '');
            }}
          >
            <Input.Search loading={searching} />
          </AutoComplete>
        </Form.Item>
        <Form.Item<string>
          label={approverName !== '' ? `확인관: ${approverName}` : '확인관'}
          name='approverId'
          rules={[
            { required: true, message: '확인관을 입력해주세요' },
            { pattern: /^[0-9]{2}-[0-9]{5,8}$/, message: '잘못된 군번입니다' },
          ]}
        >
          <AutoComplete
            options={approverOptions.map((t) => ({
              value: t.sn,
              label: renderPlaceholder(t),
            }))}
            onSearch={debouncedSearch.approver}
            onChange={(value) => {
              const selectedOption = approverOptions.find((t) => t.sn === value);
              setApproverName(selectedOption ? selectedOption.name : '');
            }}
          >
            <Input.Search loading={searching} />
          </AutoComplete>
        </Form.Item>
        <Form.Item<string>
          name='reason'
          rules={[{ required: true, message: '초과근무 내용을 입력해주세요' }]}
        >
          <Input.TextArea
            showCount
            maxLength={500}
            placeholder='초과근무 내용'
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
            {'요청하기'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
