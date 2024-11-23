'use client';

import { GroupSoldiers, listSoldiers } from '@/app/actions';
import { Card, Collapse, ConfigProvider, Input, Pagination, Skeleton } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { UserCard } from './components';

export default function ManageSoldiersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const router = useRouter();
  const [data, setData] = useState<
    Awaited<ReturnType<typeof listSoldiers>>['data'] | null
  >(null);

  const [groupedData, setGroupedData] = useState<
    Awaited<ReturnType<typeof GroupSoldiers>> | null
  >(null);
  const [query, setQuery] = useState<string>('');
  const [count, setCount] = useState(1);

  // Debounced function to update query
  const updateQuery = useCallback(
    debounce((value: string) => {
      setQuery(value);
    }, 300), // 300ms delay
    []
  );

  const onChangeQuery: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      updateQuery(event.target.value);
    },
    [updateQuery]
  );

  const handlePagination = useCallback(
    (page: number) => {
      router.push(`/soldiers/list?page=${page}`);
    },
    [router]
  );

  useEffect(() => {
    const page = parseInt(searchParams.page || '1', 10);

    if (query !== '') {
      listSoldiers({ query, page }).then(({ count, data }) => {
        setData(data);
        setCount(count);
        setGroupedData(null); // Clear grouped data
      });
    } else {
      GroupSoldiers().then((group) => {
        setGroupedData(group);
        setData(null); // Clear regular data
      });
    }
  }, [query, searchParams.page]);

  useEffect(() => {
    // Cleanup debounce on unmount
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
      {data == null && groupedData == null &&
        Array(10)
          .fill(0)
          .map((_, i) => (
            <Card key={`skeleton.${i}`}>
              <Skeleton paragraph={{ rows: 0 }} />
            </Card>
          ))}
      {data?.map((d) => (
        <UserCard key={d.sn} {...d} />
      ))
      }
      {groupedData && 
      <ConfigProvider
        theme={{
          components: {
            Collapse: {
              headerBg: '#ffffff',
              contentPadding: '0px 0px',
              contentBg: 'rgba(0, 0, 0, 0.02)'
            },
          },
        }}
        >
        <Collapse items={items} />
      </ConfigProvider>
      }
      {data && <Pagination
        className='mt-2 self-center'
        pageSize={10}
        total={count}
        current={parseInt(searchParams.page || '1', 10)}
        onChange={handlePagination}
      />}
    </div>
  );
}
