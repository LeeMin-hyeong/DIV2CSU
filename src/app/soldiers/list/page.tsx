'use client';

import { GroupSoldiers, listSoldiers } from '@/app/actions';
import {  Collapse, ConfigProvider, Empty, Input } from 'antd';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { UserCard } from './components';

export default function ManageSoldiersPage() {
  const [data, setData] = useState<
    Awaited<ReturnType<typeof listSoldiers>> | null
  >(null);

  const [groupedData, setGroupedData] = useState<
    Awaited<ReturnType<typeof GroupSoldiers>> | null
  >(null);
  const [query, setQuery] = useState<string>('');

  const updateQuery = useCallback(
    debounce((value: string) => {
      setQuery(value);
    }, 300),
    []
  );

  const onChangeQuery: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    updateQuery(event.target.value);
  };

  useEffect(() => {
    if (query !== '') {
      listSoldiers({ query }).then((data) => {
        setData(data);
        setGroupedData(null);
      });
    } else {
      GroupSoldiers().then((group) => {
        setGroupedData(group);
        setData(null);
      });
    }
  }, [query]);

  useEffect(() => {
    return () => {
      updateQuery.cancel();
    };
  }, [updateQuery]);

  const items = useMemo(() => {
    if (!groupedData) return [];
    return [
      {
        key: 'headquarters',
        label: `본부 (${groupedData.headquarters.length})`,
        children: groupedData.headquarters.map((d) => <UserCard key={d.sn} {...d} />),
      },
      {
        key: 'supply',
        label: `보급 (${groupedData.supply.length})`,
        children: groupedData.supply.map((d) => <UserCard key={d.sn} {...d} />),
      },
      {
        key: 'medical',
        label: `의무 (${groupedData.medical.length})`,
        children: groupedData.medical.map((d) => <UserCard key={d.sn} {...d} />),
      },
      {
        key: 'transport',
        label: `수송 (${groupedData.transport.length})`,
        children: groupedData.transport.map((d) => <UserCard key={d.sn} {...d} />),
      },
      {
        key: 'unclassified',
        label: `미분류 (${groupedData.unclassified.length})`,
        children: groupedData.unclassified.map((d) => <UserCard key={d.sn} {...d} />),
      },
    ];
  }, [groupedData]);

  return (
    <div className='flex flex-1 flex-col'>
      <Input placeholder='검색' onChange={onChangeQuery} />
      {data?.length == 0 && groupedData == null &&
        <div className="py-5 my-5">
          <Empty description={<p>해당 사용자가 존재하지 않습니다</p>} />
        </div>}
      {data?.map((d) => (
        <UserCard key={d.sn} {...d} />
      ))}
      {groupedData && (
        <ConfigProvider
          theme={{
            components: {
              Collapse: {
                headerBg: '#ffffff',
                contentPadding: '0px 0px',
                contentBg: 'rgba(0, 0, 0, 0)',
              },
            },
          }}
        >
          <Collapse items={items} />
        </ConfigProvider>
      )}
    </div>
  );
}
