'use client';

import { fetchPointTemplates } from '@/app/actions';
import { AutoComplete, Button, Input } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { useEffect, useState, useCallback } from 'react';

export type PointTemplatesInputProps = {
  onChange?: (reason: string, value?: number | null) => void;
};

export function PointTemplatesInput({ onChange }: PointTemplatesInputProps) {
  const [options, setOptions] = useState<DefaultOptionType[] | undefined>(undefined);

  // 템플릿 데이터를 비동기로 가져오기
  useEffect(() => {
    const loadTemplates = async () => {
      const newData = await fetchPointTemplates();

      setOptions(
        ['공통', '보급', '수송', '의무'].map((category) => ({
          label: category,
          options: newData
            .filter(({ unit }) => (category === '공통' ? unit == null : unit === category))
            .map((row) => ({
              id: row.id,
              value: row.reason,
              label: (
                <div
                  onClick={() => onChange?.(row.reason)}
                  className="flex flex-1 flex-row items-center w-full"
                  key={row.id}
                >
                  <span className="flex-1 inline-block whitespace-normal">{row.reason}</span>
                  {row.merit && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation(); // 부모 onClick 이벤트를 방지
                        onChange?.(row.reason, row.merit);
                      }}
                      type="primary"
                      aria-label={`${row.reason} - 장점`}
                    >
                      {row.merit}
                    </Button>
                  )}
                  {row.demerit && (
                    <Button
                      className="ml-2"
                      onClick={(e) => {
                        e.stopPropagation(); // 부모 onClick 이벤트를 방지
                        onChange?.(row.reason, row.demerit);
                      }}
                      type="primary"
                      danger
                      aria-label={`${row.reason} - 단점`}
                    >
                      {row.demerit}
                    </Button>
                  )}
                </div>
              ),
            })),
        }))
      );
    };

    loadTemplates();
  }, [onChange]);

  // 키보드가 열릴 때 스크롤을 고정하는 함수
  const handleKeyboardVisibility = useCallback(() => {
    const focusedElement = document.activeElement as HTMLElement;

    // 키보드가 열리면 스크롤 고정
    if (focusedElement && focusedElement.tagName === 'INPUT') {
      // `html`과 `body`의 overflow를 hidden으로 설정하여 스크롤을 고정
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed'; // 화면이 고정되도록 설정
      document.body.style.width = '100%'; // 화면 폭을 100%로 설정
      document.body.style.top = `-${window.scrollY}px`; // 현재 스크롤 위치를 유지
    } else {
      // 키보드가 닫히면 원래대로 복원
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, window.scrollY); // 스크롤 위치 복원
    }
  }, []);

  // Focus/Blur 이벤트를 감지하여 키보드 상태에 따른 스크롤 고정 처리
  useEffect(() => {
    const inputElements = document.querySelectorAll('input, textarea');
    inputElements.forEach((input) => {
      input.addEventListener('focus', handleKeyboardVisibility);
      input.addEventListener('blur', handleKeyboardVisibility);
    });

    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => {
      inputElements.forEach((input) => {
        input.removeEventListener('focus', handleKeyboardVisibility);
        input.removeEventListener('blur', handleKeyboardVisibility);
      });
    };
  }, [handleKeyboardVisibility]);

  // 화면 크기 변화 시 키보드 열림/닫힘 상태 체크
  useEffect(() => {
    const handleResize = () => {
      handleKeyboardVisibility();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleKeyboardVisibility]);

  // 터치 이벤트를 감지하여 화면을 고정하는 함수 (스크롤 방지)
  const handleTouchMove = (e: TouchEvent) => {
    if (document.activeElement?.tagName === 'INPUT') {
      e.preventDefault(); // 터치로 인한 스크롤을 방지
    }
  };

  useEffect(() => {
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // 드롭다운이 열릴 때 스크롤 고정 처리
  const handleDropdownVisibleChange = useCallback((visible: boolean) => {
    if (visible) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  }, []);

  return (
    <AutoComplete
      size="large"
      popupMatchSelectWidth
      options={options}
      onDropdownVisibleChange={handleDropdownVisibleChange}
    >
      <Input.Search size="large" placeholder="상벌점 템플릿" />
    </AutoComplete>
  );
}
