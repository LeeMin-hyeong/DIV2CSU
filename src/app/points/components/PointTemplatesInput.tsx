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
                      onClick={() => {
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
                      onClick={() => {
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
        }))
      );
    });

    // 모바일에서 키보드 열릴 때 스크롤 고정 처리
    const handleKeyboardVisibility = () => {
      const focusedElement = document.activeElement as HTMLElement;

      // 키보드가 열리면 스크롤 고정
      if (focusedElement && focusedElement.tagName === 'INPUT') {
        document.documentElement.style.overflow = 'hidden'; // 스크롤 고정
      } else {
        document.documentElement.style.overflow = ''; // 스크롤 해제
      }
    };

    // 키보드 열기/닫기 감지
    const handleResize = () => {
      handleKeyboardVisibility(); // 화면 크기 변경 시에도 호출하여 키보드 열림/닫힘 상태 체크
    };

    // Focus/Blur 이벤트 감지 (모바일에서 키보드가 열릴 때 처리)
    const inputElements = document.querySelectorAll('input, textarea');
    inputElements.forEach((input) => {
      input.addEventListener('focus', handleKeyboardVisibility);
      input.addEventListener('blur', handleKeyboardVisibility);
    });

    // Resize 이벤트 감지
    window.addEventListener('resize', handleResize);

    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => {
      window.removeEventListener('resize', handleResize);
      inputElements.forEach((input) => {
        input.removeEventListener('focus', handleKeyboardVisibility);
        input.removeEventListener('blur', handleKeyboardVisibility);
      });
    };
  }, [onChange]);

  const handleDropdownVisibleChange = (visible: boolean) => {
    if (visible) {
      // 팝업이 열리면 스크롤 고정
      document.documentElement.style.overflow = 'hidden';
    } else {
      // 팝업이 닫히면 스크롤 해제
      document.documentElement.style.overflow = '';
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
