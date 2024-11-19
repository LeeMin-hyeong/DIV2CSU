'use client';

import { listSoldiers } from '@/app/actions';
import { Card, Input, Pagination, Skeleton } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
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

  const [query, setQuery] = useState('');
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
    listSoldiers({ query, page: parseInt(searchParams.page || '1', 10) }).then(
      ({ count, data }) => {
        setData(data);
        setCount(count);
      }
    );
  }, [query, searchParams.page]);

  useEffect(() => {
    // Cleanup debounce on unmount
    return () => {
      updateQuery.cancel();
    };
  }, [updateQuery]);

  return (
    <div className='flex flex-1 flex-col'>
      <Input placeholder='검색' onChange={onChangeQuery} />
      {data == null &&
        Array(10)
          .fill(0)
          .map((_, i) => (
            <Card key={`skeleton.${i}`}>
              <Skeleton paragraph={{ rows: 0 }} />
            </Card>
          ))}
      {data?.map((d) => (
        <UserCard key={d.sn} {...d} />
      ))}
      <Pagination
        className='mt-2 self-center'
        pageSize={10}
        total={count}
        current={parseInt(searchParams.page || '1', 10)}
        onChange={handlePagination}
      />
    </div>
  );
}
