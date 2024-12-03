'use client';

import { fetchPointTemplates } from '@/app/actions';
import { AutoComplete, Button, Input } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { useEffect, useState } from 'react';

export type PointTemplatesInputProps = {
  onChange?: (reason: string, value?: number | null) => void;
};

export function PointTemplatesInput({ onChange }: PointTemplatesInputProps) {
  const [options, setOptions] = useState<DefaultOptionType[] | undefined>(undefined);

  useEffect(() => {
    fetchPointTemplates().then((newData) => {
      setOptions(
        ['공통', '보급', '수송', '의무'].map((value) => ({
          label: value,
          options: newData
            .filter(({ unit }) => (value === '공통' ? unit == null : unit === value))
            .map((row) => ({
              id: row.id,
              value: row.reason,
              label: (
                <div
                  onClick={() => {
                    onChange?.(row.reason);
                  }}
                  className='flex flex-1 flex-row items-center w-full'
                  key={row.id}
                >
                  <span className='flex-1 inline-block whitespace-normal'>{row.reason}</span>
                  {row.merit && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation(); // Click event propagation
                        onChange?.(row.reason, row.merit);
                      }}
                      type='primary'
                    >
                      {row.merit}
                    </Button>
                  )}
                  {row.demerit && (
                    <Button
                      className='ml-2'
                      onClick={(e) => {
                        e.stopPropagation(); // Click event propagation
                        onChange?.(row.reason, row.demerit);
                      }}
                      type='primary'
                      danger
                    >
                      {row.demerit}
                    </Button>
                  )}
                  <div className='mx-2' />
                </div>
              ),
            })),
        })),
      );
    });
  }, [onChange]);

  const handleDropdownVisibleChange = (visible: boolean) => {
    if (visible) {
      // 팝업이 열리면 스크롤 고정
      document.body.style.overflow = 'hidden';
    } else {
      // 팝업이 닫히면 스크롤 해제
      document.body.style.overflow = '';
    }
  };

  return (
    <AutoComplete
      size='large'
      popupMatchSelectWidth
      options={options}
      onDropdownVisibleChange={handleDropdownVisibleChange}
    >
      <Input.Search size='large' placeholder='상벌점 템플릿' />
    </AutoComplete>
  );
}
