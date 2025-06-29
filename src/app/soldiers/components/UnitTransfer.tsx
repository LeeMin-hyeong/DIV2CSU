import { Radio } from "antd";
import type { RadioChangeEvent } from "antd";

export type UnitTransferProps = {
  unit: 'headquarters' | 'supply' | 'medical' | 'transport' | 'unclassified';
  onchange?: (newUnit: 'headquarters' | 'supply' | 'medical' | 'transport' | 'unclassified') => void;
  disabled: boolean;
};

export function UnitTransfer({
  unit,
  onchange,
  disabled,
}: UnitTransferProps) {
  return (
    <Radio.Group
      className="flex flex-1 py-2"
      defaultValue={unit}
      onChange={(e: RadioChangeEvent) => {
        onchange?.(e.target.value as 'headquarters' | 'supply' | 'medical' | 'transport' | 'unclassified');
      }}
      disabled={disabled}
      block
    >
      <Radio.Button value="headquarters">본부</Radio.Button>
      <Radio.Button value="supply">보급</Radio.Button>
      <Radio.Button value="medical">의무</Radio.Button>
      <Radio.Button value="transport">수송</Radio.Button>
      <Radio.Button value='unclassified'>미분류</Radio.Button>
    </Radio.Group>
  );
}
